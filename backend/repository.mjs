import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {FixtureAdapter} from '../dist/platform.js';
import {assertFixtureData} from '../dist/contracts.js';

export class ServiceError extends Error {
  constructor(code,message,status=400){super(message);this.code=code;this.status=status;}
}
export async function localDatabaseConfig() {
  let url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key){
    try {const {stdout}=await promisify(execFile)('supabase',['status','-o','json'],{cwd:process.cwd(),timeout:15000});
      const status=JSON.parse(stdout);url ||= status.API_URL;key ||= status.SERVICE_ROLE_KEY;
    } catch {throw new ServiceError('DATABASE_UNAVAILABLE','Start local Supabase with npm run db:start.',503);}
  }
  const endpoint=new URL(url);
  if(endpoint.protocol!=='http:'||!['127.0.0.1','localhost'].includes(endpoint.hostname)||!key)
    throw new ServiceError('LOCAL_ONLY','This backend accepts only a local Supabase endpoint.',503);
  return {url:endpoint.origin,key};
}
export class Repository {
  constructor(config){this.config=config;}
  async rest(path,{method='GET',body,prefer}={}) {
    const response=await fetch(`${this.config.url}/rest/v1/${path}`,{
      method,headers:{apikey:this.config.key,Authorization:`Bearer ${this.config.key}`,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},
      ...(body!==undefined?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new ServiceError('DATABASE_ERROR','Local database request failed. Check Supabase and migrations; no fallback write was made.',503);
    const text=await response.text();return text?JSON.parse(text):null;
  }
  async workspace(tenant,initial) {
    let rows=await this.rest(`strata_workspaces?tenant=eq.${tenant}&select=*`);
    if(!rows.length){
      const engine=new FixtureAdapter();
      if(initial){
        const data=initial.data||initial;assertFixtureData(data);
        const scoped=entries=>Array.isArray(entries)?entries.filter(pair=>Array.isArray(pair)&&pair.length===2&&typeof pair[0]==='string'&&pair[0].startsWith(tenant+':')):[];
        engine.hydrate(tenant,{data,receipts:scoped(initial.receipts),pending:scoped(initial.pending)});
      }
      const state=engine.snapshot(tenant);
      await this.rest('strata_workspaces',{method:'POST',body:{tenant,state},prefer:'resolution=ignore-duplicates'});
      rows=await this.rest(`strata_workspaces?tenant=eq.${tenant}&select=*`);
    }
    const row=rows[0],engine=new FixtureAdapter();engine.hydrate(tenant,row.state);
    return {row,engine};
  }
  async commit(tenant,version,engine,proposal=null,disposition=null) {
    const committed=await this.rest('rpc/strata_commit',{method:'POST',body:{p_tenant:tenant,p_version:version,p_state:engine.snapshot(tenant),p_proposal:proposal,p_disposition:disposition}});
    if(!committed)throw new ServiceError('CONFLICT','Workspace changed in another tab. Reload before resubmitting; your draft is preserved.',409);
  }
  async proposal(tenant,id) {
    if(!/^[0-9a-f-]{36}$/i.test(id))throw new ServiceError('VALIDATION','Invalid proposal ID.');
    return (await this.rest(`strata_ai_proposals?tenant=eq.${tenant}&id=eq.${id}&select=*`))[0];
  }
}
