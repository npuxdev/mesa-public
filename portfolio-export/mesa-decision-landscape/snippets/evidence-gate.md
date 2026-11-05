# Evidence gate and coverage

**Purpose:** Show the approval rule and the metric rule as the same idea.

**When to reference:** Anyone asks "how do you keep a dashboard from lying."

**Excerpt:** exact source. `src/workflow-commands.ts` (the `finding.approve` branch) and `src/improvement-model.ts`.

```ts
if(type==='finding.approve'){if(!f.evidence.length||!Number.isInteger(f.level)||Number(f.level)<0||Number(f.level)>3||!f.opportunity||f.status==='disputed'||f.evidence.some(id=>!state.inspected.includes(id)||!d.evidence.some(e=>e.id===id)))fail('MISSING_EVIDENCE','Inspect every available citation and resolve attribution before approval.');f.status='approved';f.reviewer='Casey Morgan';}
```

```ts
export function coverage(rows: OpportunityRow[]){const eligible=rows.filter(r=>r.eligible),observed=eligible.filter(r=>r.finding);return {eligible:eligible.length,observed:observed.length,percent:eligible.length?100*observed.length/eligible.length:null};}
```

**Plain language.** Approval demands citations, an integer rubric level, and an inspection mark on each one. `not_observed` is not an integer, so it cannot pass. Coverage returns `null` when no opportunity was eligible, which the overview renders as not observed rather than 0%. `reviewedFinding()` also refuses to average two conflicting approved observations.

**Why it matters.** The review screen for finding `f-03` is the portfolio proof. The command is the part that still holds if the screen is bypassed.
