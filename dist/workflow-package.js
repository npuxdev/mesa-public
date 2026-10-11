import { ContractError, disciplines } from './contracts.js';
import { workflows, validation } from './workflow-model.js';
function error(s) { throw new ContractError('PACKAGE', s); }
const keys = (v, allow) => { if (Object.keys(v).some(k => !allow.includes(k)))
    error('Unsupported data field. Users, grants, sessions, and executable fields are excluded.'); };
export function parsePackage(raw) {
    const p = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!p || typeof p !== 'object')
        error('A JSON object is required.');
    keys(p, ['format', 'version', 'synthetic', 'profile', 'scenario', 'definition', 'facts', 'provenance']);
    if (p.format !== 'strata-scenario' || p.version !== '1.0' || p.synthetic !== true || !['portable', 'private'].includes(p.profile))
        error('Unsupported package format/version. Only synthetic local packages are accepted.');
    if (!p.scenario || !p.definition)
        error('Scenario and definition are required.');
    keys(p.scenario, ['title', 'summary', 'discipline', 'industry', 'mode', 'purpose', 'difficulty', 'duration', 'objectives', 'roles', 'rights']);
    for (const key of ['title', 'summary', 'industry', 'mode', 'purpose', 'difficulty', 'rights'])
        if (typeof p.scenario[key] !== 'string' || !p.scenario[key].trim())
            error(`${key} is required.`);
    if (!disciplines.includes(p.scenario.discipline) || !['Tabletop', 'Facilitated simulation'].includes(p.scenario.mode) || !['Practice', 'Assessment'].includes(p.scenario.purpose))
        error('Unsupported discipline, delivery mode, or purpose.');
    if (!Array.isArray(p.scenario.roles) || !Array.isArray(p.scenario.objectives) || [...p.scenario.roles, ...p.scenario.objectives].some(v => typeof v !== 'string'))
        error('Role/objective text lists are required.');
    if (!Number.isFinite(p.scenario.duration))
        error('A finite wall-time duration is required.');
    keys(p.definition, ['entities', 'transitions', 'injects', 'objectives', 'bindings', 'clock', 'termination']);
    const fields = { entities: ['id', 'name', 'kind', 'knowledge', 'resources', 'initial'], transitions: ['id', 'name', 'action', 'roleId', 'targetId', 'from', 'to', 'cost'], injects: ['id', 'title', 'body', 'notes', 'trigger', 'minute', 'condition', 'channel', 'audiences', 'artifact'], objectives: ['id', 'title', 'roleId', 'start', 'end', 'evidence', 'anchors', 'weight', 'threshold', 'exclusions'] };
    for (const [collection, allowed] of Object.entries(fields)) {
        const items = p.definition[collection];
        if (!Array.isArray(items) || items.length > 100)
            error(`${collection} must be an array of at most 100 objects.`);
        for (const item of items) {
            if (!item || typeof item !== 'object' || Array.isArray(item))
                error('Invalid definition object.');
            keys(item, allowed);
            if (typeof item.id !== 'string' || !item.id)
                error('Stable object ID required.');
            for (const field of allowed) {
                if (['resources', 'cost', 'minute', 'start', 'end', 'weight', 'threshold'].includes(field)) {
                    if (!Number.isFinite(item[field]))
                        error(`Invalid ${field}.`);
                }
                else if (['audiences', 'anchors'].includes(field)) {
                    if (!Array.isArray(item[field]) || item[field].some((v) => typeof v !== 'string'))
                        error(`Invalid ${field}.`);
                }
                else if (typeof item[field] !== 'string')
                    error(`Missing ${field}.`);
            }
        }
    }
    if (!['stepped', 'realtime'].includes(p.definition.clock) || !Number.isFinite(p.definition.termination))
        error('Invalid clock/termination policy.');
    if (!Array.isArray(p.definition.bindings))
        error('Bindings must be an array.');
    if (p.definition.entities.some((e) => !['human_role', 'environment_actor', 'threat_actor', 'service'].includes(e.kind)) || p.definition.transitions.some((t) => !['verify_backup', 'isolate_segment', 'restore_service', 'authorize_supplier', 'approve_statement', 'disrupt_service', 'spread_compromise', 'exfiltrate_data'].includes(t.action)))
        error('Unregistered entity or action.');
    if (p.definition.injects.some((i) => !['internal', 'customer', 'vendor', 'media'].includes(i.channel) || !['manual', 'time', 'condition'].includes(i.trigger)) || p.definition.objectives.some((o) => o.anchors.length !== 4))
        error('Unsupported inject or rubric schema.');
    const safe = structuredClone(p);
    safe.definition.bindings = [];
    delete safe.facts;
    safe.provenance = 'Imported synthetic template; no verified signature or approval inherited.';
    const s = { ...safe.scenario, id: 'inspect', status: 'draft', revision: '0', validation: 'stale', expert: 'none', version: 1, available: true };
    const checks = validation(s, { definition: safe.definition, history: [], checks: [], releaseNotes: '' }, { facts: [] });
    if (checks.some(c => c.severity === 'blocker'))
        error(checks.filter(c => c.severity === 'blocker').map(c => `${c.object}: ${c.message}`).join(' '));
    return safe;
}
export function exportPackage(d, id, profile, includeFacts = false) {
    const s = d.scenarios.find(s => s.id === id);
    if (!s || !s.available || s.rights.includes('prohibited'))
        error('Export prohibited for this edition.');
    if (profile === 'portable' && !s.rights.includes('Portable'))
        error('This edition permits private backup only.');
    const a = workflows(d).authors[id];
    const definition = structuredClone(a.definition);
    definition.bindings = [];
    const scenario = { title: s.title, summary: s.summary, discipline: s.discipline, industry: s.industry, mode: s.mode, purpose: s.purpose, difficulty: s.difficulty, duration: s.duration, objectives: [...s.objectives], roles: [...s.roles], rights: s.rights };
    return { format: 'strata-scenario', version: '1.0', synthetic: true, profile, scenario, definition, ...(profile === 'private' && includeFacts ? { facts: d.facts.filter(f => a.definition.bindings.includes(f.id) && f.status === 'accepted').map(f => ({ id: f.id, label: f.label, value: f.value, source: f.source })) } : {}), provenance: 'Synthetic local package. Assets are inline text only. No expert approval, identities, grants, sessions, or participant records.' };
}
