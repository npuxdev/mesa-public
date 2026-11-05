import test from 'node:test';
import assert from 'node:assert/strict';
import {inferProposal,validateProposal} from '../backend/inference.mjs';
import {protectRequest,validateScope,acceptanceCommand} from '../backend/api.mjs';
import {FixtureAdapter} from '../src/platform.ts';
import {authorDigest} from '../src/workflow-model.ts';

const output={title:'Revised Title',summary:'Reviewed description',body:'Inject narrative',notes:'Facilitator only',rationale:'Explicit authority cue',warnings:[]};
test('AI acceptance edits only reviewed narrative and invalidates validation; stale or published bases fail',async()=>{
  const scope={tenant:'atlas',persona:'manager',state:'ready',epoch:0},engine=new FixtureAdapter();await engine.read(scope);
  await engine.command(scope,{type:'scenario.fork',resourceId:'sc-ir',payload:{},idempotencyKey:'ai-accept-test'});
  let data=engine.snapshot('atlas').data,s=data.scenarios.at(-1),a=data.workflow.authors[s.id],inject=a.definition.injects[0];
  const proposal={id:'test',scenario_id:s.id,target:'inject:'+inject.id,base_digest:authorDigest(s,a),base_version:s.version,content:output};
  await engine.command(scope,acceptanceCommand(data,proposal));data=engine.snapshot('atlas').data;
  const edited=data.workflow.authors[s.id].definition.injects[0];
  assert.deepEqual(edited,{...inject,title:output.title,body:output.body,notes:output.notes});
  assert.equal(data.scenarios.at(-1).validation,'stale');assert.equal(data.scenarios.at(-1).version,s.version+1);
  assert.throws(()=>acceptanceCommand(data,proposal),e=>e.code==='CONFLICT');
  assert.throws(()=>acceptanceCommand(data,{...proposal,scenario_id:'sc-ir'}),e=>e.code==='CONFLICT');
});
test('Responses request uses strict schema, bounded tokens and no remote storage',async()=>{
  const result=await inferProposal({title:'Synthetic'},'Improve authority cue',{key:'test-only',fetcher:async(url,options)=>{
    assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body);
    assert.equal(body.store,false);assert.equal(body.max_output_tokens,2200);assert.equal(body.text.format.strict,true);assert.equal(body.tools,undefined);
    assert.match(body.instructions,/untrusted data/);assert.match(body.instructions,/Human review/);
    return Response.json({status:'completed',model:'test-model',usage:{total_tokens:12},output:[{content:[{type:'output_text',text:JSON.stringify(output)}]}]});
  }});assert.deepEqual(result.content,output);assert.equal(result.model,'test-model');
});
test('Refusal, incomplete, malformed output and upstream failures never become proposals',async()=>{
  for(const response of [Response.json({}, {status:429}),Response.json({status:'incomplete'}),Response.json({status:'completed',output:[{content:[{type:'refusal'}]}]}),Response.json({status:'completed',output:[{content:[{type:'output_text',text:'not json'}]}]})]){
    await assert.rejects(inferProposal({},'request',{key:'test-only',fetcher:async()=>response}));
  }
  assert.throws(()=>validateProposal({...output,execute:'publish'}));assert.throws(()=>validateProposal({...output,warnings:[7]}));
});
test('Local endpoints reject rebinding and cross-origin requests',()=>{
  const req={headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'}};
  protectRequest(req);
  assert.throws(()=>protectRequest({...req,headers:{...req.headers,host:'attacker.example:3000'}}));
  assert.throws(()=>protectRequest({...req,headers:{...req.headers,origin:'https://attacker.example'}}));
  assert.throws(()=>protectRequest({...req,headers:{...req.headers,'sec-fetch-site':'cross-site'}}));
  assert.throws(()=>validateScope({tenant:'other',persona:'manager',state:'ready',epoch:0}));
});
test('Server snapshots persist workflow changes and original idempotent receipts across engine restarts',async()=>{
  const scope={tenant:'atlas',persona:'manager',state:'ready',epoch:0},first=new FixtureAdapter();await first.read(scope);
  const command={type:'scenario.fork',resourceId:'sc-ir',payload:{},idempotencyKey:'durable-fork'};
  const receipt=await first.command(scope,command),saved=first.snapshot('atlas'),second=new FixtureAdapter();second.hydrate('atlas',saved);await second.read(scope);
  assert.deepEqual(await second.commandStatus(scope,'durable-fork'),receipt);
  assert.deepEqual(await second.command(scope,command),receipt);
  assert.equal(second.snapshot('atlas').data.scenarios.length,saved.data.scenarios.length);
  await assert.rejects(second.command(scope,{...command,resourceId:'sc-dr'}),error=>error.code==='IDEMPOTENCY');
});
