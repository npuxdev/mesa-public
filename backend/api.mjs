import {randomBytes} from 'node:crypto';
import {Repository,ServiceError,localDatabaseConfig} from './repository.mjs';
import {inferProposal,validateProposal} from './inference.mjs';
import {can,personaLabels} from '../dist/platform.js';
import {authorDigest,workflows} from '../dist/workflow-model.js';
import {assertMutation} from '../dist/contracts.js';
import {handleExpandedAi,startAiRunner,suspendSessionAi} from './ai-service.mjs';

const sessions=new Map(),active=new Set(),budgets=new Map();
let repository;
const database=async()=>repository ||= new Repository(await localDatabaseConfig());
export const startAutomation=()=>startAiRunner(database);

function headerGet(headers, name) {
  if (!headers) return null;
  if (typeof headers.get === 'function') return headers.get(name);
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  return key == null ? null : headers[key];
}

/** Loopback-only origin check for the Next.js local harness (default port 3000). */
export function protectRequest(input) {
  const headers = input.headers ?? input;
  const host = headerGet(headers, 'host') || '';
  const origin = `http://${host}`;
  if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)) {
    throw new ServiceError('FORBIDDEN', 'Invalid local host.', 403);
  }
  const port = new URL(origin).port || '80';
  const expected = String(process.env.PORT || '3000');
  if (port !== expected && port !== '3000') {
    throw new ServiceError('FORBIDDEN', 'Invalid local host.', 403);
  }
  const reqOrigin = headerGet(headers, 'origin');
  if (headerGet(headers, 'sec-fetch-site') === 'cross-site' || (reqOrigin && reqOrigin !== origin)) {
    throw new ServiceError('FORBIDDEN', 'Cross-origin requests are blocked.', 403);
  }
}

export function validateScope(scope) {
  if (!scope || !['atlas', 'harbor'].includes(scope.tenant) || !Object.hasOwn(personaLabels, scope.persona) || !Number.isInteger(scope.epoch) || !['ready', 'loading', 'error', 'empty', 'stale', 'disconnected', 'revoked', 'expired', 'conflict'].includes(scope.state)) {
    throw new ServiceError('SCOPE', 'Invalid local development scope.');
  }
  return scope;
}

async function readJson(request) {
  const type = headerGet(request.headers, 'content-type') || '';
  if (!type.startsWith('application/json')) throw new ServiceError('VALIDATION', 'JSON is required.', 415);
  const buf = Buffer.from(await request.arrayBuffer());
  if (buf.length > 3_000_000) throw new ServiceError('TOO_LARGE', 'Request exceeds the local limit.', 413);
  try { return JSON.parse(buf.toString()); } catch { throw new ServiceError('VALIDATION', 'Invalid JSON.'); }
}

function jsonResponse(status, value, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(JSON.stringify(value), {status, headers});
}

const publicProposal = (p) => ({id: p.id, target: p.target, scenarioId: p.scenario_id, status: p.status, content: p.content, model: p.model, baseVersion: p.base_version, createdAt: p.created_at});

export function acceptanceCommand(data, p) {
  const s = data.scenarios.find((s) => s.id === p.scenario_id), a = workflows(data).authors[p.scenario_id];
  if (!s || !a || s.status !== 'draft' || s.version !== p.base_version || authorDigest(s, a) !== p.base_digest) throw new ServiceError('CONFLICT', 'The scenario changed since generation. Generate a new proposal against the current draft.', 409);
  validateProposal(p.content);
  const inject = p.target.startsWith('inject:') ? a.definition.injects.find((i) => i.id === p.target.slice(7)) : null;
  if (p.target !== 'overview' && !inject) throw new ServiceError('TARGET', 'Proposal target no longer exists.', 409);
  if (inject && !p.content.body.trim()) throw new ServiceError('AI_SCHEMA', 'Inject narrative cannot be empty.', 422);
  return {type: inject ? 'scenario.inject' : 'scenario.save', resourceId: s.id, expectedVersion: s.version, idempotencyKey: `ai:${p.id}`, payload: inject ? {...inject, itemId: inject.id, title: p.content.title, body: p.content.body, notes: p.content.notes} : {title: p.content.title, summary: p.content.summary}};
}

/** Fetch-compatible API entry used by Next.js Route Handlers. */
export async function handleApiRequest(request) {
  const path = new URL(request.url).pathname;
  try {
    protectRequest(request);
    if (path === '/api/bootstrap' && request.method === 'GET') {
      const cookie = /strata_local=([a-f0-9]+)/.exec(headerGet(request.headers, 'cookie') || '')?.[1];
      let session = sessions.get(cookie);
      const headers = {};
      if (!session || session.expires < Date.now()) {
        if (sessions.size > 1000) sessions.clear();
        const id = randomBytes(32).toString('hex');
        session = {csrf: randomBytes(32).toString('hex'), expires: Date.now() + 86400000};
        sessions.set(id, session);
        headers['Set-Cookie'] = `strata_local=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`;
      }
      let db = false;
      try { const repo = await database(); await repo.rest('strata_workspaces?select=tenant&limit=1'); db = true; } catch {}
      return jsonResponse(200, {mode: 'local', database: db, ai: !!process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', csrf: session.csrf, identity: 'synthetic-local-development'}, {headers});
    }
    if (request.method !== 'POST') throw new ServiceError('METHOD', 'POST required.', 405);
    const session = sessions.get(/strata_local=([a-f0-9]+)/.exec(headerGet(request.headers, 'cookie') || '')?.[1]);
    if (!session || session.expires < Date.now() || headerGet(request.headers, 'x-strata-csrf') !== session.csrf) {
      throw new ServiceError('SESSION', 'Reload to establish a local session.', 401);
    }
    const input = await readJson(request), scope = validateScope(input.scope), repo = await database();
    // Persona switching is deliberately a LOCAL dev harness, never production auth.
    const {row, engine} = await repo.workspace(scope.tenant, can(scope, 'author') ? input.initial : undefined);
    if (path === '/api/read') return jsonResponse(200, await engine.read(scope));
    if (path === '/api/command-status') return jsonResponse(200, await engine.commandStatus(scope, String(input.id || '')));
    if (path === '/api/command') {
      if (input.command?.type === 'session.pause') {
        assertMutation(input.command);
        if (!can(scope, 'facilitate') || scope.state !== 'ready') throw new ServiceError('FORBIDDEN', 'Pause requires a current facilitator scope.', 403);
        await suspendSessionAi(repo, scope.tenant, input.command.resourceId);
        const fresh = await repo.workspace(scope.tenant); await fresh.engine.read(scope);
        const receipt = await fresh.engine.command(scope, {...input.command, expectedVersion: undefined});
        await repo.commit(scope.tenant, fresh.row.version, fresh.engine);
        return jsonResponse(200, receipt);
      }
      assertMutation(input.command); await engine.read(scope);
      const receipt = await engine.command(scope, input.command);
      if (['session.pause', 'session.end', 'session.cancel', 'session.archive'].includes(input.command.type)) await suspendSessionAi(repo, scope.tenant, input.command.resourceId);
      await repo.commit(scope.tenant, row.version, engine);
      return jsonResponse(200, receipt);
    }
    const expanded = await handleExpandedAi(repo, scope, input, path);
    if (expanded !== undefined) return jsonResponse(200, expanded);
    if (!can(scope, 'author') || scope.state !== 'ready') throw new ServiceError('FORBIDDEN', 'AI authoring requires a current author scope.', 403);
    if (path === '/api/ai/list') {
      const proposals = await repo.rest(`strata_ai_proposals?tenant=eq.${scope.tenant}&actor=eq.${scope.persona}&order=created_at.desc&limit=50`);
      return jsonResponse(200, proposals.filter((p) => !input.scenarioId || p.scenario_id === input.scenarioId).map(publicProposal));
    }
    if (path === '/api/ai/propose') {
      const {scenarioId, target, request: aiRequest, id} = input;
      if (typeof aiRequest !== 'string' || !aiRequest.trim() || aiRequest.length > 4000 || typeof target !== 'string' || typeof scenarioId !== 'string' || !/^([0-9a-f]{8}-){1}[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '')) {
        throw new ServiceError('VALIDATION', 'Choose an overview/inject and enter a request (maximum 4,000 characters).');
      }
      const existing = await repo.proposal(scope.tenant, id);
      if (existing) {
        if (existing.actor !== scope.persona || existing.request !== aiRequest || existing.target !== target || existing.scenario_id !== scenarioId) throw new ServiceError('IDEMPOTENCY', 'Request ID was already used for different content.', 409);
        return jsonResponse(200, publicProposal(existing));
      }
      const data = engine.snapshot(scope.tenant).data, s = data.scenarios.find((s) => s.id === scenarioId), a = workflows(data).authors[scenarioId];
      if (!s || !a || s.status !== 'draft') throw new ServiceError('IMMUTABLE', 'AI changes require an editable draft.', 409);
      const inject = target.startsWith('inject:') ? a.definition.injects.find((i) => i.id === target.slice(7)) : null;
      if (target !== 'overview' && !inject) throw new ServiceError('TARGET', 'Select overview or an existing inject. Transition logic must be edited explicitly.');
      if (active.has(scope.tenant)) throw new ServiceError('AI_BUSY', 'Another AI request is in progress in this workspace.', 429);
      const budget = budgets.get(scope.tenant) || {start: Date.now(), count: 0}; if (Date.now() - budget.start > 3600000) { budget.start = Date.now(); budget.count = 0; }
      if (budget.count >= 20) throw new ServiceError('AI_RATE_LIMIT', 'Local limit of 20 generations per workspace per hour reached.', 429);
      budget.count++; budgets.set(scope.tenant, budget); active.add(scope.tenant);
      const proposal = {id, tenant: scope.tenant, actor: scope.persona, scenario_id: scenarioId, target, base_digest: authorDigest(s, a), base_version: s.version, request: aiRequest, model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', content: {}, status: 'generating'};
      try {
        await repo.rest('strata_ai_proposals', {method: 'POST', body: proposal});
        const context = {title: s.title, summary: s.summary, discipline: s.discipline, target, inject, roles: a.definition.entities.filter((e) => e.kind === 'human_role').map((e) => ({id: e.id, name: e.name})), registeredTransitions: a.definition.transitions, objectives: a.definition.objectives.map((o) => ({title: o.title, roleId: o.roleId}))};
        const generated = await inferProposal(context, aiRequest);
        await repo.rest(`strata_ai_proposals?id=eq.${id}&tenant=eq.${scope.tenant}`, {method: 'PATCH', body: {...generated, status: 'proposed'}});
        return jsonResponse(200, publicProposal({...proposal, ...generated, status: 'proposed'}));
      } catch (err) {
        try { await repo.rest(`strata_ai_proposals?id=eq.${id}&tenant=eq.${scope.tenant}`, {method: 'PATCH', body: {status: 'failed'}}); } catch {}
        throw err;
      } finally { active.delete(scope.tenant); }
    }
    if (path === '/api/ai/decide') {
      const p = await repo.proposal(scope.tenant, String(input.id || ''));
      if (!p || p.actor !== scope.persona) throw new ServiceError('UNAVAILABLE', 'Proposal unavailable.', 404);
      const status = input.accept === true ? 'accepted' : 'rejected';
      if (p.status === status) return jsonResponse(200, {status});
      if (p.status !== 'proposed') throw new ServiceError('INVALID_STATE', 'Proposal is no longer pending.', 409);
      await engine.read(scope);
      if (input.accept === true) {
        await engine.command(scope, acceptanceCommand(engine.snapshot(scope.tenant).data, p));
      }
      await repo.commit(scope.tenant, row.version, engine, p.id, status);
      return jsonResponse(200, {status});
    }
    throw new ServiceError('NOT_FOUND', 'Endpoint unavailable.', 404);
  } catch (err) {
    return jsonResponse(err.status || (err.code === 'CONFLICT' ? 409 : 400), {
      code: err.code || 'REQUEST_FAILED',
      message: err.code ? err.message : 'Request failed. Check local services; no automatic retry was made.',
    });
  }
}
