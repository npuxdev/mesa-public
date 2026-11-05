# Scope projection

**Purpose:** Show that participant UI is a filtered record, not a CSS hide.

**When to reference:** Access-control or multi-role product questions. Be honest about the client-bundle limit.

**Excerpt:** `src/platform.ts` (`scopeProjection`)

```ts
for(const [id,x] of Object.entries(workflow.exercises))if(!can(scope,'facilitate')){
  const role=assignedRole(x,scope);x.events=x.events.filter(e=>e.audiences.includes(role)||scope.persona==='observer');
  const allowed=new Set(x.injects.filter(i=>i.state==='released'&&i.definition.audiences.includes(role)).map(i=>i.definition.id));
  x.injects=x.injects.filter(i=>allowed.has(i.definition.id));for(const i of x.injects)i.definition.notes='';
  if(x.pinned){x.pinned.definition.injects=x.pinned.definition.injects.filter(i=>allowed.has(i.id));for(const i of x.pinned.definition.injects)i.notes='';x.pinned.definition.objectives=[];}
  x.requests=[];x.assessmentImpact=[];x.messages=x.messages.filter(m=>(!m.audiences||m.audiences.includes(role))&&(m.thread!=='media'||role==='role-1'));
  if(scope.persona==='observer'||scope.persona==='guest'){x.commands=[];x.decisions=[];}
}
```

**Plain language.** If you are not facilitating, you only receive released cues for your role, and facilitator notes are blanked. Pinned objectives are removed from that view so the rubric is not sitting in the participant payload. Consultant plus a non-Atlas tenant throws. Observer and guest lose program records entirely.

**Why it matters.** The rule is in the adapter that serves `/api/read`. I still do not call it production authorization: personas are a cookie-selected fixture, and scenario source such as GLASSHOUSE is also compiled into browser assets (`docs/engineering/GLASSHOUSE-IMPLEMENTATION.md`).
