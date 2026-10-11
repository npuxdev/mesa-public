import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile),network='strata-local-loopback';
try {
  try{await run('docker',['network','inspect',network]);}catch{await run('docker',['network','create','--driver','bridge','--opt','com.docker.network.bridge.host_binding_ipv4=127.0.0.1',network]);}
  console.log('Starting local Supabase (database volumes preserved)…');
  await run('supabase',['start','--network-id',network],{maxBuffer:16*1024*1024});
  const {stdout}=await run('docker',['ps','--filter','name=supabase_','--format','{{.Names}}']);
  for(const name of stdout.trim().split('\n').filter(n=>n.endsWith('_strata-local'))){
    const {stdout:details}=await run('docker',['inspect',name]);
    const bindings=Object.values(JSON.parse(details)[0].NetworkSettings.Ports||{}).flat().filter(Boolean);
    if(bindings.some(p=>!['127.0.0.1','::1'].includes(p.HostIp))){
      await run('supabase',['stop']);throw Error('Supabase ports were not loopback-only. Stack stopped safely; database volume preserved.');
    }
  }
  console.log('Supabase ready. API: http://127.0.0.1:54321 · Studio: http://127.0.0.1:54323');
}catch(error){console.error(error.message?.includes('loopback')?error.message:'Local Supabase startup failed. Check Docker availability and port conflicts. Credentials were not printed.');process.exitCode=1;}
