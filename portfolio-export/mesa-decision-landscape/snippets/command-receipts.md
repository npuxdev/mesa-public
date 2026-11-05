# Command receipts

**Purpose:** Show that a click is a command with a lifecycle, not a boolean save.

**When to reference:** A hiring manager asks how you model writes, retries, or "the button said it worked."

**Excerpt:** `src/contracts.ts`

```ts
export type CommandStatus = 'submitted' | 'accepted' | 'executed' | 'rejected' | 'unknown';
export type CommandReceipt = {
  commandId: string;
  idempotencyKey: string;
  status: CommandStatus;
  committedEventIds: string[];
  failureCode?: string;
};
export type MetricView = {
  key: string;
  label: string;
  value: number | null;
  displayState: 'supported' | 'not_observed' | 'suppressed' | 'incomparable';
  unit: string;
  numerator?: number;
  denominator?: number;
  coveragePercent?: number;
  definitionVersion: string;
  evidenceCutoff: string;
};
```

**Plain language.** Every mutation is supposed to come back as a receipt. `accepted` means the server took the command. `executed` means the handler committed events. `unknown` is how a dropped response gets reconciled to the original id instead of being sent again as a new fact. Metrics use the same honesty: a null value plus `not_observed` or `suppressed`, so the UI is not forced to draw a zero.

**Why it matters.** This is the reusable pattern under the readiness copy. The five statuses and four display states are the contract I would keep if the domain changed.
