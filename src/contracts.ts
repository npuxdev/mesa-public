export type UiRequest<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T; fetchedAt: string; stale: boolean }
  | { status: 'error'; code: string; message: string; retryable: boolean }
  | { status: 'unavailable' };
export type Permission = { capability: string; resourceId: string; allowed: boolean; reasonCode?: string };
export type ScopedView<T> = { tenantId: string; resourceId: string; revision: string; permissions: Permission[]; view: T };
export type CommandStatus = 'submitted' | 'accepted' | 'executed' | 'rejected' | 'unknown';
export type CommandReceipt = { commandId: string; idempotencyKey: string; status: CommandStatus; committedEventIds: string[]; failureCode?: string };
export type MetricView = { key: string; label: string; value: number | null; displayState: 'supported' | 'not_observed' | 'suppressed' | 'incomparable'; unit: string; numerator?: number; denominator?: number; coveragePercent?: number; definitionVersion: string; evidenceCutoff: string };
export type Shell = 'SH-ACCESS' | 'SH-PROGRAM' | 'SH-AUTHOR' | 'SH-EXERCISE' | 'SH-CONTROL' | 'SH-REVIEW' | 'SH-PUBLISHER' | 'SH-OPS';
export type ScreenDefinition = { id: string; title: string; route: string; shell: Shell; requirementIds: string[]; serviceDependencies: string[]; componentIds: string[]; stateFixtureIds: string[] };
export type Persona = 'manager' | 'admin' | 'participant' | 'coach' | 'observer' | 'guest' | 'consultant' | 'publisher' | 'operator';
export type FixtureState = 'ready' | 'loading' | 'empty' | 'stale' | 'error' | 'expired' | 'revoked' | 'disconnected' | 'conflict';
export type Scope = { tenant: 'atlas' | 'harbor'; persona: Persona; state: FixtureState; epoch: number };
export const disciplines = ['Incident response', 'Disaster recovery', 'Business continuity', 'Crisis management'] as const;
export type Discipline = typeof disciplines[number];
export type Scenario = { id: string; title: string; discipline: Discipline; industry: string; mode: string; purpose: string; difficulty: string; duration: number; revision: string; status: 'published' | 'draft' | 'retired'; available: boolean; summary: string; objectives: string[]; roles: string[]; rights: string; validation: 'valid' | 'stale' | 'invalid'; expert: 'none' | 'revoked' | 'derived'; version: number };
export type Session = { id: string; exerciseId: string; title: string; scenarioId: string; discipline: Discipline; purpose: string; mode: string; status: 'draft' | 'scheduled' | 'lobby' | 'running' | 'paused' | 'ended' | 'review' | 'archived' | 'canceled'; when: string; owner: string; role: string; duration: number; revision: string; simulationTime: string; wallTime: string; sequence: number };
export type Finding = { id: string; title: string; subject: string; status: 'draft' | 'approved' | 'disputed' | 'corrected'; level: number | 'not_observed' | 'not_applicable'; evidence: string[]; opportunity: string; claim: string; attribution: string; reviewer: string; challenge?: string; version: number };
export type Report = { id: string; title: string; type: string; revision: string; status: 'draft' | 'in_review' | 'approved' | 'published' | 'superseded' | 'withdrawn'; audience: string; date: string; findingIds: string[]; summary: string; version: number };
export type ActionItem = { id: string; title: string; findingId: string; owner: string; due: string; status: 'planned' | 'in_progress' | 'blocked' | 'implemented' | 'verification_pending' | 'verified' | 'reopened'; verification: 'not_scheduled' | 'pending' | 'passed' | 'failed'; acceptance: string; evidence: string; history: string[]; version: number };
export type Evidence = { sessionId?:string; audiences?:string[]; participantId?:string; id: string; title: string; type: 'log' | 'document' | 'message'; time: string; version: string; source: string; content: string; downloadable: boolean };
export type Fact = { id: string; label: string; value: string; source: string; status: 'proposed' | 'accepted' | 'excluded' | 'conflict'; sensitivity: string; validUntil: string; reviewer?: string };
export type Person = { id: string; name: string; team: string; role: string; exercises: number; status: string };
export type FixtureData = { workflow?: import('./workflow-model.js').WorkflowData; scenarios: Scenario[]; sessions: Session[]; findings: Finding[]; reports: Report[]; actions: ActionItem[]; evidence: Evidence[]; facts: Fact[]; people: Person[]; audit: { action: string; resource: string; at: string }[]; settings: { name: string; timezone: string; promotions: boolean; retention: string }; goals: { id: string; title: string; status: string; evidence: string }[]; messages: { id: string; text: string; source: string }[]; decisions: { id: string; question: string; owner: string; rationale: string; status: string }[]; teamNote: string; teamVersion: number };
export type Mutation = { type: string; resourceId: string; payload: Record<string, unknown>; expectedVersion?: number; idempotencyKey: string };
export interface ReadinessAdapter {
  readonly mode: 'fixture' | 'live';
  read(scope: Scope): Promise<UiRequest<ScopedView<FixtureData>>>;
  command(scope: Scope, command: Mutation): Promise<CommandReceipt>;
  commandStatus(scope: Scope, id: string): Promise<CommandReceipt | null>;
  clearScope(): void;
}

export class ContractError extends Error { constructor(public code: string, message: string) { super(message); } }
export function assertMutation(value: unknown): asserts value is Mutation {
  if (!value || typeof value !== 'object') throw new ContractError('INVALID_COMMAND', 'A command object is required.');
  const v = value as Record<string, unknown>;
  if (typeof v.type !== 'string' || typeof v.resourceId !== 'string' || typeof v.idempotencyKey !== 'string' || !v.idempotencyKey || !v.payload || typeof v.payload !== 'object' || Array.isArray(v.payload)) throw new ContractError('INVALID_COMMAND', 'The command does not match the fixture contract.');
}
export function assertMetric(value: MetricView): MetricView {
  if (value.displayState !== 'supported' && value.value !== null) throw new ContractError('INVALID_METRIC', 'Unsupported metrics must not carry a numeric value.');
  if (value.denominator !== undefined && value.denominator < 1) throw new ContractError('INVALID_METRIC', 'A positive denominator is required.');
  return value;
}
export function assertFixtureData(value: unknown): asserts value is FixtureData {
  if (!value || typeof value !== 'object') throw new ContractError('INVALID_RESPONSE', 'Read model unavailable.');
  for (const key of ['scenarios','sessions','findings','reports','actions','evidence','facts','people','audit','goals','messages','decisions']) {
    if (!Array.isArray((value as Record<string,unknown>)[key])) throw new ContractError('INVALID_RESPONSE', `Invalid ${key} response.`);
  }
}
