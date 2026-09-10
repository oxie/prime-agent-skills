"""Fixed full Chrome153 launcher seam. Browser-level restrictions, not an OS sandbox.
Only the actual reviewed Chrome runs under the existing named AppArmor profile.
The caller owns environment clearing, BrowserSession attachment and full cleanup.
"""
import hashlib
import json
import os
from pathlib import Path
import stat

VERSION="153.0.8010.36"
RUNTIME_ROOT=Path("/home/prime-agent/.local/share/prime-agent/browser-use-tools/chrome")/VERSION
CHROME=RUNTIME_ROOT/"opt/google/chrome/chrome"
CHROME_SHA256="ac7f9884974b551d29c89f24d0c697f373ce595a920ddafced441dd2554142db"
MANIFEST_SHA256="58c797d6b65eb7c0b34d6b8c8cc763118f13b0b817fc9292f16b9c056b7c8787"
PROFILE=Path("/etc/apparmor.d/chrome")
PROFILE_SHA256="9da127c4af5d1639aa4102387a29a04548299a832c5f9e803a6b0c2cfb79ef76"

def digest(path):
    h=hashlib.sha256()
    with path.open("rb") as stream:
        while data:=stream.read(1024*1024): h.update(data)
    return h.hexdigest()

def verify_runtime():
    if RUNTIME_ROOT.resolve()!=RUNTIME_ROOT or not RUNTIME_ROOT.is_dir():
        raise RuntimeError("fixed private runtime missing or symlinked")
    if CHROME.resolve()!=CHROME:
        raise RuntimeError("private browser path contains a symlink")
    manifest=RUNTIME_ROOT/"runtime-manifest.json"
    if manifest.is_symlink() or digest(manifest)!=MANIFEST_SHA256:
        raise RuntimeError("runtime manifest identity mismatch")
    value=json.loads(manifest.read_text())
    expected={row["path"] for row in value["files"]}
    actual={p.relative_to(RUNTIME_ROOT).as_posix() for p in (RUNTIME_ROOT/"opt/google/chrome").rglob("*")}
    actual.add("opt/google/chrome")
    if actual!=expected: raise RuntimeError("private browser resource set changed")
    for row in value["files"]:
        path=RUNTIME_ROOT/row["path"];info=path.lstat()
        if info.st_uid!=os.getuid() or stat.S_IMODE(info.st_mode)!=int(row["mode"],8):
            raise RuntimeError("private browser owner/mode changed")
        if row["kind"]=="directory":
            if not stat.S_ISDIR(info.st_mode): raise RuntimeError("private browser directory changed")
        elif (not stat.S_ISREG(info.st_mode) or info.st_nlink!=1 or info.st_size!=row["size"]
              or digest(path)!=row["sha256"]):
            raise RuntimeError("private browser resource identity changed")
    if digest(CHROME)!=CHROME_SHA256: raise RuntimeError("raw Chrome identity mismatch")
    return {"version":VERSION,"chrome":str(CHROME),"chrome_sha256":CHROME_SHA256,
            "manifest_sha256":MANIFEST_SHA256,"resource_entries":len(expected)}

def launch_argv(profile, proxyport, target_port):
    for value in (proxyport,target_port):
        if type(value) is not int or not 1<=value<=65535: raise ValueError("port must be an integer1..65535")
    if proxyport==target_port: raise ValueError("proxy/target ports must differ")
    profile=Path(profile)
    if not profile.is_absolute() or profile.resolve()!=profile or len(os.fsencode(profile))>80:
        raise ValueError("short absolute nonsymlink fresh profile required")
    info=profile.lstat()
    if (not stat.S_ISDIR(info.st_mode) or info.st_uid!=os.getuid()
            or stat.S_IMODE(info.st_mode)!=0o700 or any(profile.iterdir())):
        raise ValueError("profile must be empty, owned and0700")
    verify_runtime()
    if (PROFILE.is_symlink() or digest(PROFILE)!=PROFILE_SHA256
            or os.path.lexists("/etc/apparmor.d/local/chrome")):
        raise RuntimeError("reviewed existing Chrome profile/override changed")
    return ["/usr/bin/aa-exec","-p","chrome","--",str(CHROME),
        "--headless=new","--remote-debugging-address=127.0.0.1","--remote-debugging-port=0",
        f"--user-data-dir={profile}","--no-first-run","--disable-extensions",
        "--disable-background-networking","--disable-component-update","--disable-sync",
        "--disable-default-apps","--disable-quic","--force-webrtc-ip-handling-policy=disable_non_proxied_udp",
        f"--proxy-server=http://127.0.0.1:{proxyport}",
        f"--proxy-bypass-list=<-loopback>;127.0.0.1:{target_port}",
        "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1","about:blank"]
