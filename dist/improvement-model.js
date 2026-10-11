import { ContractError } from './contracts.js';
import { workflows, hash, minutes, uid } from './workflow-model.js';
import { fixtureCutoff } from './fixtures.js';
export function improvement(d) { return workflows(d).improvement ??= { views: [], retests: {}, assistance: {} }; }
export const completed = (s) => ['ended', 'review', 'archived'].includes(s.status);
export const assistance = (d, id) => improvement(d).assistance[id] || 'unknown';
export const interventions = (d, id) => workflows(d).exercises[id].assessmentImpact.filter(s => !s.startsWith('Session ended · '));
export const rubricSignature = (o) => hash({ title: o.title, anchors: o.anchors, evidence: o.evidence, start: o.start, end: o.end, weight: o.weight, threshold: o.threshold, exclusions: o.exclusions });
export function reviewedFinding(d, session, objective) {
    const w = workflows(d);
    const list = d.findings.filter(f => f.subject === 'Team' && f.status === 'approved' && typeof f.level === 'number' && w.findings[f.id]?.sessionId === session && w.findings[f.id]?.objectiveId === objective && f.evidence.length && f.evidence.every(id => d.evidence.some(e => e.id === id && e.sessionId === session)));
    // Conflicting approved observations are not silently averaged or cherry-picked.
    return list.length === 1 ? list[0] : undefined;
}
export function opportunityRows(d) {
    const w = workflows(d);
    return d.sessions.filter(s => !['draft', 'scheduled', 'lobby', 'canceled'].includes(s.status)).flatMap(s => {
        const x = w.exercises[s.id];
        return (x.pinned?.definition.objectives || []).filter(o => x.objectives.includes(o.id)).map(o => {
            const assigned = x.roster.filter(r => r.role === o.roleId && !r.observer && r.verified), role = x.pinned?.definition.entities.find(r => r.id === o.roleId)?.name || o.roleId;
            const delivered = x.injects.some(i => i.state === 'released' && i.definition.audiences.includes(o.roleId) && i.minute >= o.start && i.minute <= o.end && i.minute <= minutes(s.simulationTime));
            const intervened = interventions(d, s.id).length > 0, eligible = assigned.length > 0 && delivered;
            return { session: s, objective: o, role, teams: [...new Set(assigned.map(r => d.people.find(p => p.id === r.id)?.team || 'Unrecorded team'))], finding: eligible && !intervened ? reviewedFinding(d, s.id, o.id) : undefined, eligible, reason: !assigned.length ? 'N/A · role unassigned' : !delivered ? 'N/O · qualifying cue not released' : intervened ? 'Excluded from scoring · intervention review required' : 'Released opportunity', cohort: assigned.length, intervened };
        });
    });
}
export const filterKeys = ['q', 'discipline', 'team', 'role', 'difficulty', 'revision', 'purpose', 'period', 'from', 'to'];
export function analyticsSelection(d, q, sessionId) {
    const w = workflows(d), period = q.get('period') || '90', end = q.get('to') || fixtureCutoff.slice(0, 10);
    let start = q.get('from') || '';
    if (period !== 'custom') {
        const dt = new Date(fixtureCutoff);
        dt.setUTCDate(dt.getUTCDate() - (period === '30' ? 29 : 89));
        start = dt.toISOString().slice(0, 10);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || !Number.isFinite(Date.parse(start)) || !Number.isFinite(Date.parse(end)) || start > end)
        return { sessions: [], rows: [], start, end, error: 'Choose a valid date range with start on or before end.' };
    const match = (key, v) => !q.get(key) || q.get(key) === 'all' || q.get(key) === v;
    const roleTeam = (s) => w.exercises[s.id]?.roster.some(r => !r.observer && r.verified && match('role', w.exercises[s.id].pinned?.definition.entities.find(e => e.id === r.role)?.name || r.role) && match('team', d.people.find(p => p.id === r.id)?.team || 'Unrecorded team'));
    const sessions = d.sessions.filter(s => (!sessionId || s.id === sessionId) && s.when.slice(0, 10) >= start && s.when.slice(0, 10) <= end && match('discipline', s.discipline) && match('purpose', s.purpose) && match('revision', s.revision) && match('difficulty', w.exercises[s.id]?.pinned?.difficulty || 'Unrecorded') && roleTeam(s) && (!q.get('q') || `${s.title} ${s.discipline} ${w.exercises[s.id]?.pinned?.definition.objectives.map(o => o.title).join(' ')}`.toLowerCase().includes(q.get('q').toLowerCase())));
    const ids = new Set(sessions.map(s => s.id));
    const rows = opportunityRows(d).filter(r => ids.has(r.session.id) && match('role', r.role) && (!q.get('team') || q.get('team') === 'all' || r.teams.includes(q.get('team'))));
    return { sessions, rows, start, end, error: '' };
}
export function coverage(rows) { const eligible = rows.filter(r => r.eligible), observed = eligible.filter(r => r.finding); return { eligible: eligible.length, observed: observed.length, percent: eligible.length ? 100 * observed.length / eligible.length : null }; }
export function comparison(d, baseline, retest, baseObjective, testObjective) {
    const w = workflows(d), b = d.sessions.find(s => s.id === baseline), t = d.sessions.find(s => s.id === retest), bx = w.exercises[baseline], tx = w.exercises[retest], bo = bx?.pinned?.definition.objectives.find(o => o.id === baseObjective), to = tx?.pinned?.definition.objectives.find(o => o.id === testObjective);
    if (!b || !t || !bo || !to)
        return { eligible: false, checks: [{ condition: 'Authorized pinned sessions and opportunities', baseline: 'Unavailable', retest: 'Unavailable', same: false }], digest: '', base: undefined, test: undefined };
    const checks = [{ condition: 'Distinct sessions', baseline: b.id, retest: t.id, same: b.id !== t.id }, { condition: 'Retest after baseline', baseline: b.when, retest: t.when, same: Date.parse(t.when) > Date.parse(b.when) }, { condition: 'Completed', baseline: b.status, retest: t.status, same: completed(b) && completed(t) },
        { condition: 'Selected opportunities', baseline: bo.id, retest: to.id, same: bx.objectives.includes(bo.id) && tx.objectives.includes(to.id) },
        { condition: 'Scenario revision', baseline: `${b.scenarioId} / ${b.revision}`, retest: `${t.scenarioId} / ${t.revision}`, same: b.scenarioId === t.scenarioId && b.revision === t.revision },
        { condition: 'Role', baseline: bx.pinned.definition.entities.find(r => r.id === bo.roleId)?.name || bo.roleId, retest: tx.pinned.definition.entities.find(r => r.id === to.roleId)?.name || to.roleId, same: bo.roleId === to.roleId },
        { condition: 'Rubric and opportunity conditions', baseline: rubricSignature(bo), retest: rubricSignature(to), same: rubricSignature(bo) === rubricSignature(to) },
        { condition: 'Difficulty', baseline: bx.pinned.difficulty, retest: tx.pinned.difficulty, same: bx.pinned.difficulty === tx.pinned.difficulty },
        { condition: 'Purpose / delivery', baseline: `${b.purpose} / ${b.mode}`, retest: `${t.purpose} / ${t.mode}`, same: b.purpose === t.purpose && b.mode === t.mode },
        { condition: 'Assistance', baseline: assistance(d, b.id), retest: assistance(d, t.id), same: assistance(d, b.id) !== 'unknown' && assistance(d, b.id) === assistance(d, t.id) },
        { condition: 'Intervention exclusions', baseline: String(interventions(d, b.id).length), retest: String(interventions(d, t.id).length), same: !interventions(d, b.id).length && !interventions(d, t.id).length }];
    const base = opportunityRows(d).find(r => r.session.id === baseline && r.objective.id === baseObjective)?.finding, test = opportunityRows(d).find(r => r.session.id === retest && r.objective.id === testObjective)?.finding;
    checks.push({ condition: 'One evidence-backed approved team observation per opportunity', baseline: base ? `${base.id} / v${base.version}` : 'Not observed / unresolved', retest: test ? `${test.id} / v${test.version}` : 'Not observed / unresolved', same: !!base && !!test });
    return { eligible: checks.every(c => c.same), checks, digest: hash(checks), base, test };
}
export function currentResult(d, r) { if (!r.result)
    return false; const cmp = comparison(d, r.baseline, r.session, r.baselineObjective, r.retestObjective); return cmp.eligible && cmp.digest === r.result.conditions && cmp.base?.id === r.result.baselineFinding && cmp.base.version === r.result.baselineVersion && cmp.test?.id === r.result.finding && cmp.test.version === r.result.findingVersion && r.result.evidence.every(ref => d.evidence.some(e => e.id === ref.id && e.version === ref.version && e.sessionId === r.session)); }
export function verificationState(d, id) { const latest = improvement(d).retests[id]?.at(-1), a = d.actions.find(a => a.id === id); return latest?.result ? (currentResult(d, latest) ? a?.status !== 'verified' && latest.state === 'passed' ? 'review_required' : latest.state : 'review_required') : latest ? 'pending' : 'not_scheduled'; }
export function contentRecords(d, sessions) { const w = workflows(d), keys = [...new Set(sessions.map(s => `${s.scenarioId}|${s.revision}`))]; return keys.map(key => { const selected = sessions.filter(s => `${s.scenarioId}|${s.revision}` === key), ids = new Set(selected.map(s => s.id)), findings = d.findings.filter(f => f.subject === 'Team' && ids.has(w.findings[f.id]?.sessionId)), approved = findings.filter(f => f.status === 'approved').length, decided = findings.filter(f => ['approved', 'corrected'].includes(f.status)).length; return { key, title: w.exercises[selected[0].id].pinned?.title || key, revision: selected[0].revision, sessions: selected, approved, decided, acceptance: decided ? 100 * approved / decided : null }; }); }
export function analyticsCsv(d, q, sessionId) {
    const m = analyticsSelection(d, q, sessionId), w = workflows(d), prefix = ['SYNTHETIC_LOCAL', 'readiness-v2', fixtureCutoff, m.start, m.end, q.toString()], headers = ['classification', 'definition', 'cutoff', 'range_start', 'range_end', 'filters'];
    let rows;
    if (q.get('view') === 'delivery')
        rows = [[...headers, 'session', 'lifecycle', 'wall_time', 'simulation_time', 'interventions', 'unresolved_commands'], ...m.sessions.map(s => [...prefix, s.id, s.status, s.wallTime, s.simulationTime, interventions(d, s.id).length, w.exercises[s.id].commands.filter(cmd => cmd.status !== 'executed').length])];
    else if (q.get('view') === 'content')
        rows = [[...headers, 'content', 'revision', 'exercises', 'completed', 'approved', 'decided', 'acceptance_percent'], ...contentRecords(d, m.sessions).map(r => [...prefix, r.title, r.revision, r.sessions.length, r.sessions.filter(completed).length, r.approved, r.decided, r.acceptance])];
    else
        rows = [[...headers, 'session', 'revision', 'purpose', 'objective', 'role', 'eligible', 'reviewed', 'level', 'finding', 'exclusion'], ...m.rows.map(r => [...prefix, r.session.id, r.session.revision, r.session.purpose, r.objective.title, r.role, r.eligible ? 1 : 0, r.finding ? 1 : 0, r.finding?.level ?? '', r.finding?.id || '', r.reason])];
    const cell = (v) => `"${String(v ?? '').replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
    return rows.map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
export function improvementCommand(d, scope, cmd, h) {
    const { need, version, required } = h, p = cmd.payload, id = cmd.resourceId, w = workflows(d), state = improvement(d);
    const fail = (code, msg) => { throw new ContractError(code, msg); };
    if (cmd.type === 'analytics.save-view') {
        need('analytics');
        const screen = String(p.screen);
        if (!['ANA-01', 'ANA-02'].includes(screen))
            fail('VALIDATION', 'Unsupported analytics view.');
        const q = new URLSearchParams(String(p.query || ''));
        for (const key of [...q.keys()])
            if (![...filterKeys, 'view'].includes(key))
                q.delete(key);
        state.views.push({ id: uid('view'), owner: scope.persona, name: required('name'), screen, params: screen === 'ANA-02' ? required('session') : '', query: q.toString() });
        return true;
    }
    if (cmd.type === 'analytics.delete-view') {
        need('analytics');
        const v = state.views.find(v => v.id === id && v.owner === scope.persona);
        if (!v)
            fail('UNAVAILABLE', 'Saved view unavailable.');
        state.views = state.views.filter(v => v !== v);
        return true;
    }
    if (cmd.type === 'analytics.bind-finding') {
        need('review');
        const f = d.findings.find(f => f.id === id);
        if (!f)
            fail('UNAVAILABLE', 'Finding unavailable.');
        version(f.version);
        const fs = w.findings[id], o = w.exercises[fs.sessionId]?.pinned?.definition.objectives.find(o => o.id === required('objective'));
        if (!o)
            fail('VALIDATION', 'Choose a pinned opportunity from this finding’s session.');
        required('rationale');
        fs.objectiveId = o.id;
        f.version++;
        fs.history.push({ version: f.version, state: f.status, claim: f.claim, reason: `Measurement mapping: ${o.title} · ${String(p.rationale)}` });
        return true;
    }
    if (cmd.type === 'analytics.assistance') {
        need('facilitate');
        const x = w.exercises[id];
        if (!x)
            fail('UNAVAILABLE', 'Session unavailable.');
        version(x.version);
        const a = required('assistance');
        if (!['none', 'facilitated', 'ai', 'unknown'].includes(a))
            fail('VALIDATION', 'Choose a recorded assistance condition.');
        required('rationale');
        state.assistance[id] = a;
        x.version++;
        return true;
    }
    if (!cmd.type.startsWith('corrective.'))
        return false;
    need('program');
    const a = d.actions.find(a => a.id === id);
    if (!a)
        fail('UNAVAILABLE', 'Action unavailable.');
    version(a.version);
    if (cmd.type === 'corrective.update') {
        const next = required('status');
        if (!['planned', 'in_progress', 'blocked', 'implemented', 'verification_pending', 'reopened'].includes(next))
            fail('RETEST_REQUIRED', 'Use the reviewed retest workflow to verify an action.');
        if (['implemented', 'verification_pending'].includes(next))
            a.evidence = required('evidence');
        if (p.owner !== undefined) {
            const owner = required('owner');
            if (!d.people.some(p => p.name === owner))
                fail('VALIDATION', 'Choose an existing owner.');
            a.owner = owner;
        }
        if (p.due !== undefined) {
            const due = required('due');
            if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || !Number.isFinite(Date.parse(due)))
                fail('VALIDATION', 'Choose a valid due date.');
            a.due = due;
        }
        a.status = next;
        if (next === 'reopened')
            a.verification = 'pending';
        a.history.push(`Implementation ${next} · ${required('rationale')}`);
    }
    else if (cmd.type === 'corrective.link-retest') {
        need('review');
        const source = d.findings.find(f => f.id === a.findingId), baseline = w.findings[a.findingId]?.sessionId, session = required('session'), s = d.sessions.find(s => s.id === session);
        if (!source || source.subject !== 'Team' || source.status !== 'approved' || !baseline || !s || session === baseline || w.exercises[session]?.baseline !== a.id || !['draft', 'scheduled', 'lobby'].includes(s.status))
            fail('RETEST_REQUIRED', 'Plan and link a separate prelaunch session for this action before observing its result.');
        if (state.retests[id]?.some(r => r.session === session))
            fail('IMMUTABLE', 'This session already has a planned target. Schedule a new attempt instead of changing its target.');
        const bo = required('baselineObjective'), ro = required('retestObjective');
        if (!w.exercises[baseline].pinned?.definition.objectives.some(o => o.id === bo) || !w.exercises[session].pinned?.definition.objectives.some(o => o.id === ro))
            fail('VALIDATION', 'Select pinned opportunities on both sides.');
        if (w.findings[a.findingId].objectiveId !== bo)
            fail('RETEST_REQUIRED', 'Map the source finding to the selected baseline opportunity first.');
        const target = Number(required('target'));
        if (!Number.isInteger(target) || target < 0 || target > 3)
            fail('RUBRIC', 'Choose a target anchor from zero to three.');
        required('rationale');
        (state.retests[id] ??= []).push({ id: uid('retest'), baseline, session, baselineObjective: bo, retestObjective: ro, target, state: 'pending' });
        a.verification = 'pending';
        if (a.status === 'verified')
            a.status = 'verification_pending';
    }
    else if (cmd.type === 'corrective.verify') {
        need('review');
        const r = state.retests[id]?.at(-1);
        if (!r)
            fail('RETEST_REQUIRED', 'Link a retest first.');
        if (r.result)
            fail('IMMUTABLE', 'Recorded verification is immutable. Link a new retest attempt after reopening.');
        if (!a.evidence.trim() || !['implemented', 'verification_pending', 'reopened'].includes(a.status))
            fail('IMPLEMENTATION_REQUIRED', 'Record implementation evidence before reviewing effectiveness.');
        const cmp = comparison(d, r.baseline, r.session, r.baselineObjective, r.retestObjective);
        if (!cmp.eligible || !cmp.base || !cmp.test || cmp.base.id !== a.findingId)
            fail('RETEST_REQUIRED', 'Both sessions need reviewed evidence and comparable measurement conditions for this action’s source finding.');
        if (p.digest !== cmp.digest)
            fail('CONFLICT', 'Retest conditions changed after preview.');
        const fs = w.findings[cmp.test.id];
        if (cmp.test.evidence.some(id => !fs.inspected.includes(id)) || cmp.base.evidence.some(id => !w.findings[cmp.base.id].inspected.includes(id)))
            fail('MISSING_EVIDENCE', 'Inspect every baseline and retest finding citation before verification.');
        if (p.acceptance !== 'yes')
            fail('ACCEPTANCE_REQUIRED', 'Confirm that the cited result addresses this action’s written acceptance criteria.');
        const passed = Number(cmp.test.level) >= r.target;
        const requested = required('outcome');
        if (requested !== (passed ? 'passed' : 'failed'))
            fail('RUBRIC', 'The selected outcome must agree with the approved anchor and target.');
        r.state = passed ? 'passed' : 'failed';
        r.result = { finding: cmp.test.id, findingVersion: cmp.test.version, baselineFinding: cmp.base.id, baselineVersion: cmp.base.version, evidence: cmp.test.evidence.map(id => { const e = d.evidence.find(e => e.id === id); return { id, version: e.version }; }), conditions: cmp.digest, rationale: required('rationale'), reviewer: scope.persona, at: new Date().toISOString() };
        a.verification = r.state;
        a.status = passed ? 'verified' : 'reopened';
    }
    else
        return false;
    a.version++;
    a.history.push(`${cmd.type} · ${String(p.rationale || '')} · ${new Date().toISOString()}`);
    return true;
}
