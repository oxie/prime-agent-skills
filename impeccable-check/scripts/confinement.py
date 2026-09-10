"""Prime adaptation. Linux x86_64 fail-closed detector execution policy."""
import ctypes
import errno
import os
import platform
import resource

READ = (1 << 2) | (1 << 3)
WRITE = (1 << 1) | sum(1 << n for n in range(4, 15))
EXEC = 1
ALL = READ | WRITE | EXEC
libc = ctypes.CDLL(None, use_errno=True)

class Ruleset(ctypes.Structure):
    _fields_ = [('fs', ctypes.c_uint64), ('net', ctypes.c_uint64)]
class PathRule(ctypes.Structure):
    _pack_ = 1
    _fields_ = [('access', ctypes.c_uint64), ('fd', ctypes.c_int)]
class Filter(ctypes.Structure):
    _fields_ = [('code', ctypes.c_ushort), ('jt', ctypes.c_ubyte), ('jf', ctypes.c_ubyte), ('k', ctypes.c_uint)]
class Program(ctypes.Structure):
    _fields_ = [('length', ctypes.c_ushort), ('filter', ctypes.POINTER(Filter))]

def checked(value):
    if value < 0:
        raise OSError(ctypes.get_errno(), os.strerror(ctypes.get_errno()))
    return value

def confine(read_paths, exec_paths, writable):
    if platform.machine() != 'x86_64':
        raise RuntimeError('only reviewed x86_64 policy supported')
    abi = checked(libc.syscall(444, 0, 0, 1))
    if abi < 4:
        raise RuntimeError('Landlock ABI 4 required')
    # All filesystem rights through ABI3 plus ABI4 TCP bind/connect, no net grants.
    ruleset = Ruleset(ALL, 3)
    fd = checked(libc.syscall(444, ctypes.byref(ruleset), ctypes.sizeof(ruleset), 0))
    try:
        for path, rights in [(p,READ) for p in read_paths] + [(p,READ|EXEC) for p in exec_paths] + [(writable,READ|WRITE)]:
            pfd = os.open(path, os.O_PATH | os.O_CLOEXEC)
            try:
                if not os.path.isdir(path):
                    rights &= ~(1 << 3)
                rule = PathRule(rights, pfd)
                checked(libc.syscall(445, fd, 1, ctypes.byref(rule), 0))
            finally:
                os.close(pfd)
        checked(libc.prctl(38, 1, 0, 0, 0))  # NO_NEW_PRIVS
        checked(libc.syscall(446, fd, 0))
    finally:
        os.close(fd)
    # Architecture guard (also deny x32), deny all sockets and process creation.
    # No TCP, UDP, IPv6, Unix, netlink, packet or vsock sockets.
    rows = [(0x20,0,0,4),(0x15,1,0,0xc000003e),(0x06,0,0,0x80000000),
            (0x20,0,0,0),(0x35,0,1,0x40000000),(0x06,0,0,0x80000000)]
    denied = [42,101,165,166,175,176,246,272,298,304,308,311,313,321,323,425,426,427,438]
    # ptrace/mount/modules/kexec/unshare/perf/open_by_handle/setns/process_vm_writev,
    # BPF/userfaultfd/io_uring/pidfd_getfd.
    denied += [41,43,49,50,53,56,57,58,435]
    denied += [62,129,200,234,297,310,424,434]  # signals, process_vm_readv, pidfds
    denied += [90,91,92,93,94,132,235,260,261,268,280,452]
    denied += list(range(188,190+1)) + list(range(197,199+1))  # set/remove xattr
    # chmod/chown/timestamps/xattrs are not mediated by Landlock ABI4.
    for number in denied:
        rows += [(0x15,0,1,number),(0x06,0,0,0x50000|errno.EPERM)]
    rows += [(0x06,0,0,0x7fff0000)]
    filters = (Filter*len(rows))(*(Filter(*r) for r in rows))
    checked(libc.prctl(22,2,ctypes.byref(Program(len(rows),filters)),0,0))
    resource.setrlimit(resource.RLIMIT_CORE,(0,0))
    resource.setrlimit(resource.RLIMIT_CPU,(15,15))
    resource.setrlimit(resource.RLIMIT_FSIZE,(16*1024*1024,16*1024*1024))
    resource.setrlimit(resource.RLIMIT_NOFILE,(256,256))
    limit = 1024**3
    resource.setrlimit(resource.RLIMIT_AS,(limit,limit))
    resource.setrlimit(resource.RLIMIT_NPROC,(512,512))
