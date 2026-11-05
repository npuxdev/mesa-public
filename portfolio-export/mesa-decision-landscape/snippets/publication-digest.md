# Digest-checked publication

**Purpose:** Show how a published scenario is frozen to the bytes that were reviewed.

**When to reference:** Questions about optimistic concurrency, stale forms, or "why not just update the row."

**Excerpt:** `src/workflow-model.ts` and `src/workflow-commands.ts`

```ts
export const hash=(value:unknown)=>{let n=2166136261;for(const ch of JSON.stringify(value)){n^=ch.charCodeAt(0);n=Math.imul(n,16777619);}return (n>>>0).toString(16).padStart(8,'0');};
export function authorDigest(s:Scenario,a:AuthorState){return hash({title:s.title,summary:s.summary,difficulty:s.difficulty,duration:s.duration,definition:a.definition,rights:s.rights});}
```

Publish then requires `validatedDigest === authorDigest(s, a)` and `payload.digest === authorDigest(s, a)`. A mismatch throws `CONFLICT`. A non-draft edit throws `IMMUTABLE` and tells the author to fork (`scenario.publish` / draft guard in `src/workflow-commands.ts`).

**Plain language.** Validation stores a fingerprint of the definition. The publish form posts that fingerprint back. If the draft moved, the publish fails and the record stays as it was. The fingerprint is FNV-style and 32 bits. It is a staleness check. It is not a signature.

**Why it matters.** Immutable publication is a product rule enforced in the command handler, not a badge in the header.
