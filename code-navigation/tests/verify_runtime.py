from pathlib import Path
import argparse, hashlib, json, os, shutil, subprocess, tempfile
p=argparse.ArgumentParser()
p.add_argument('--source',type=Path,required=True)
p.add_argument('--patch',type=Path,default=Path(__file__).resolve().parents[1]/'patches/named-import-calls.patch')
p.add_argument('--manifest',type=Path,default=Path('/home/prime-agent/.local/share/prime-agent/graft-tools/runtime.json'))
args=p.parse_args()
base = Path('/home/prime-agent/.local/share/prime-agent/graft-tools')
runtime = base / 'upstream'
manifest = json.loads(args.manifest.read_text())
assert manifest['schema_version'] == 2 and manifest['ready'] is True
assert manifest['source_commit'] == '3a85a2f40e283ac0c9b617d9a4bead18d73c3c70'
assert manifest['source_integrity']['unchanged'] is False
assert manifest['reviewed_patch'] == {'id':'named-import-calls-v1','sha256':'43cfd51e9ae9cacff7a1d83e5dd19bd7eee2f197f84907a1e1d7febd9705a959'}
assert hashlib.sha256(args.patch.read_bytes()).hexdigest() == '43cfd51e9ae9cacff7a1d83e5dd19bd7eee2f197f84907a1e1d7febd9705a959'
integrity=manifest['source_integrity']
assert set(integrity['base_hashes']) == set(integrity['hashes'])
changed=sorted(name for name in integrity['hashes'] if integrity['hashes'][name]!=integrity['base_hashes'][name])
assert changed == ['src/graph/extract.ts','src/graph/resolve.ts'] == sorted(integrity['changed_files'])
for group in [integrity['hashes'], manifest['modules'], manifest['native_modules']]:
    for name, digest in group.items():
        assert not Path(name).is_absolute() and '..' not in Path(name).parts
        assert hashlib.sha256((runtime / name).read_bytes()).hexdigest() == digest, name
assert all(command['exit_code'] == 0 for command in manifest['commands'])
assert hashlib.sha256((runtime / 'package-lock.json').read_bytes()).hexdigest() == manifest['dependencies']['lock_sha256']
env={'PATH':'/usr/bin:/bin','HOME':'/tmp','GIT_CONFIG_NOSYSTEM':'1','GIT_CONFIG_GLOBAL':'/dev/null',
     'GIT_OPTIONAL_LOCKS':'0','GIT_CONFIG_COUNT':'2','GIT_CONFIG_KEY_0':'core.fsmonitor',
     'GIT_CONFIG_VALUE_0':'false','GIT_CONFIG_KEY_1':'core.hooksPath','GIT_CONFIG_VALUE_1':'/dev/null'}
def git_source(*flags):
    return subprocess.run(['/usr/bin/git','-C',str(args.source),*flags],env=env,check=True,capture_output=True,text=True,timeout=30).stdout.strip()
assert git_source('rev-parse','HEAD') == manifest['source_commit'], 'base checkout has wrong commit'
assert not git_source('status','--porcelain'), 'base checkout must remain clean'
assert set(git_source('ls-files','-z').split('\0')) == set(integrity['base_hashes']) | {''}, 'base manifest file set differs from Git'

with tempfile.TemporaryDirectory(prefix='graft-patch-proof-',dir='/tmp') as scratch:
    scratch=Path(scratch)
    for name,digest in integrity['base_hashes'].items():
        original=args.source/name
        assert hashlib.sha256(original.read_bytes()).hexdigest() == digest, name
        copied=scratch/name; copied.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(original,copied)
    for flags in [['--check'],[]]:
        subprocess.run(['/usr/bin/git','-C',str(scratch),'apply',*flags,str(args.patch.resolve())],env=env,check=True,timeout=30)
    for name,digest in integrity['hashes'].items():
        assert hashlib.sha256((scratch/name).read_bytes()).hexdigest()==digest,name
print(json.dumps({'ok':True,'schema_version':2,'patch_sha256':'43cfd51e9ae9cacff7a1d83e5dd19bd7eee2f197f84907a1e1d7febd9705a959','base_and_current_files':len(integrity['hashes']),'changed_files':changed,'dist_files':len(manifest['modules']),'native_files':len(manifest['native_modules']),'successful_commands':len(manifest['commands']),'patch_derivation_verified':True}))
