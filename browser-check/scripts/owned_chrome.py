"""Owned Chrome lifecycle for a fresh dedicated CLI, never the agent kernel."""
import os
from pathlib import Path
import selectors
import signal
import subprocess
import time

def require(ok,message):
    if not ok:raise RuntimeError(message)

def fields(pid):
    return Path(f"/proc/{pid}/stat").read_text().rsplit(") ",1)[1].split()

class OwnedChrome:
    """Fresh CLI is sole wait owner. Do not poll/reap leader before group shutdown."""
    def __init__(self):
        require(not Path(f"/proc/self/task/{os.getpid()}/children").read_text().strip(),"Owner requires a fresh dedicated CLI")
        self.process=None;self.pidfd=None;self.identities={};self.receipt=None

    def start(self, command, logfile):
        # Caller already owns this holder if pinning or identity capture fails.
        require(self.process is None,"Owner cannot start twice")
        self.process=subprocess.Popen(command,stdin=subprocess.DEVNULL,stdout=logfile,stderr=logfile,
            close_fds=True,start_new_session=True)
        self.pidfd=os.pidfd_open(self.process.pid)
        self.identities[self.process.pid]=fields(self.process.pid)[19]

    def exited(self):
        selector=selectors.DefaultSelector()
        try:
            selector.register(self.pidfd,selectors.EVENT_READ)
            return bool(selector.select(0))
        finally:selector.close()

    def observe(self):
        queue=[os.getpid()];seen=set();rows=[]
        while queue:
            parent=queue.pop()
            if parent in seen:continue
            seen.add(parent)
            try:
                if parent!=os.getpid():require(fields(parent)[19]==self.identities[parent],"Owned parent identity changed")
                children=set()
                for task in Path(f"/proc/{parent}/task").iterdir():
                    try:children.update((task/"children").read_text().split())
                    except FileNotFoundError:continue
            except FileNotFoundError:continue
            for raw in children:
                pid=int(raw)
                try:
                    row=fields(pid)
                    if int(row[1])!=parent:continue
                    old=self.identities.get(pid)
                    require(old is None or old==row[19],"Owned PID identity changed")
                    self.identities[pid]=row[19]
                    queue.append(pid)
                    require(len(self.identities)<=128,"Owned process count exceeded128")
                    status=Path(f"/proc/{pid}/status").read_text()
                    cmd=Path(f"/proc/{pid}/cmdline").read_bytes().replace(b"\0",b" ")
                    if fields(pid)[19]!=row[19]:continue
                    rows.append({"pid":pid,"start_ticks":row[19],"state":row[0],
                        "renderer":b"--type=renderer" in cmd,
                        "status":{k:v.strip() for k,v in (line.split(":",1) for line in status.splitlines() if ":" in line)
                                  if k in ("NoNewPrivs","Seccomp","Seccomp_filters","NSpid","VmRSS","CapEff","CapPrm")}})
                except FileNotFoundError:continue
        return rows

    def close(self):
        # Popen has never been polled/waited, so even an exited leader is unreaped.
        # Its numeric process group cannot have been recycled by this sole owner.
        if self.receipt is not None:return self.receipt
        errors=[];reaped=[]
        if self.process is None:
            require(not Path(f"/proc/self/task/{os.getpid()}/children").read_text().strip(),"Unexpected child after failed spawn")
            return {"browser_exit":None,"adopted_reaped":[],"no_owned_children":True}
        try:self.observe()
        except Exception as exc:errors.append(type(exc).__name__+": "+str(exc))
        if self.process.returncode is None:
            try:os.killpg(self.process.pid,signal.SIGTERM)
            except ProcessLookupError:pass
            try:self.process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                try:os.killpg(self.process.pid,signal.SIGKILL)
                except ProcessLookupError:pass
                self.process.wait(timeout=2)
        if self.pidfd is not None:
            os.close(self.pidfd);self.pidfd=None
        # Crashpad may create a new session; this CLI is a subreaper. Adopted
        # children are pinned before signaling, not found by process-name scans.
        end=time.monotonic()+4
        while True:
            children=Path(f"/proc/self/task/{os.getpid()}/children").read_text().split()
            if not children:break
            require(time.monotonic()<end,"Owned child cleanup deadline")
            for value in children:
                pid=int(value);fd=os.pidfd_open(pid)
                try:
                    row=fields(pid)
                    require(int(row[1])==os.getpid(),"Refuse unrelated child")
                    require(pid not in self.identities or self.identities[pid]==row[19],"Reused child PID")
                    try:signal.pidfd_send_signal(fd,signal.SIGKILL)
                    except ProcessLookupError:pass  # Exited but still owned/unreaped.
                    selector=selectors.DefaultSelector()
                    try:
                        selector.register(fd,selectors.EVENT_READ)
                        require(bool(selector.select(max(0,end-time.monotonic()))),"Owned child did not exit")
                    finally:selector.close()
                    got,status=os.waitpid(pid,os.WNOHANG);require(got==pid,"Owned child not reaped")
                    reaped.append({"pid":pid,"start_ticks":row[19],"wait_status":status})
                finally:os.close(fd)
        require(not errors,"; ".join(errors))
        self.receipt={"browser_exit":self.process.returncode,"adopted_reaped":reaped,"no_owned_children":True}
        return self.receipt
