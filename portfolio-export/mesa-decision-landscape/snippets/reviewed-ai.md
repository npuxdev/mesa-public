# Reviewed AI acceptance

**Purpose:** Show that model output becomes a normal draft command only after a digest check.

**When to reference:** "Where does the model sit in the system?" Answer with this, not with a demo of generation.

**Excerpt:** `backend/api.mjs` (`acceptanceCommand`)

```js
export function acceptanceCommand(data,p) {
  const s=data.scenarios.find(s=>s.id===p.scenario_id),a=workflows(data).authors[p.scenario_id];
  if(!s||!a||s.status!=='draft'||s.version!==p.base_version||authorDigest(s,a)!==p.base_digest)throw new ServiceError('CONFLICT','The scenario changed since generation. Generate a new proposal against the current draft.',409);
  validateProposal(p.content);
  const inject=p.target.startsWith('inject:')?a.definition.injects.find(i=>i.id===p.target.slice(7)):null;
  if(p.target!=='overview'&&!inject)throw new ServiceError('TARGET','Proposal target no longer exists.',409);
  if(inject&&!p.content.body.trim())throw new ServiceError('AI_SCHEMA','Inject narrative cannot be empty.',422);
  return {type:inject?'scenario.inject':'scenario.save',resourceId:s.id,expectedVersion:s.version,idempotencyKey:`ai:${p.id}`,payload:inject?{...inject,itemId:inject.id,title:p.content.title,body:p.content.body,notes:p.content.notes}:{title:p.content.title,summary:p.content.summary}};
}
```

**Plain language.** A proposal remembers the draft version and digest it was built from. Accepting it rewrites only overview title/summary or inject title/body/notes, through the same commands a person would send. Published scenarios never enter this function. Idempotency is `ai:{id}` so a double click does not apply twice.

**Why it matters.** The portfolio videos skip the provider on purpose. This function is the proof that generation and approval are different operations. Wider workbench jobs follow the same rule: they create drafts and cannot publish (`docs/engineering/BOUNDED-AI-SPEC.md`).
