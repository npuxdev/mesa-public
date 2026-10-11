import { ContractError } from './contracts.js';
import { workflows, snapshot, authorDigest, validation, uid, appendEvent, clock, minutes, reportDigest, reportSnapshot, allowedActions } from './workflow-model.js';
import { parsePackage } from './workflow-package.js';
import { glasshouseEvidence, glasshouseActions } from './glasshouse.js';
function fail(code, message) { throw new ContractError(code, message); }
const list = (v) => Array.isArray(v) ? v.map(String) : String(v || '').split(',').map(s => s.trim()).filter(Boolean);
const number = (v, min = 0, max = 480) => { const n = Number(v); if (!Number.isFinite(n) || n < min || n > max)
    fail('VALIDATION', `Value must be between ${min} and ${max}.`); return n; };
export function workflowCommand(d, scope, m, g) {
    const { type, resourceId: id, payload: p } = m, { need, version, required } = g, w = workflows(d);
    if (type.startsWith('scenario.') || type === 'package.import') {
        need('author');
        if (type === 'package.import') {
            const pack = parsePackage(p.package);
            const sid = uid('import');
            const s = { ...pack.scenario, id: sid, status: 'draft', revision: 'Draft 1', validation: 'stale', expert: 'none', version: 1, available: true };
            d.scenarios.push(s);
            w.authors[sid] = { definition: pack.definition, history: [], checks: [], releaseNotes: '' };
            w.authors[sid].history.push(snapshot(s, w.authors[sid], 'Imported into new draft; no approval inherited'));
            return true;
        }
        const s = d.scenarios.find(s => s.id === id);
        if (!s)
            fail('UNAVAILABLE', 'Scenario unavailable.');
        const a = w.authors[id];
        if (type === 'scenario.fork' || type === 'scenario.restore') {
            if (!s.available)
                fail('ENTITLEMENT_REQUIRED', 'This edition cannot be customized.');
            const source = type === 'scenario.restore' ? a.history.find(h => h.version === Number(p.historyVersion)) : snapshot(s, a, 'Fork base');
            if (!source)
                fail('UNAVAILABLE', 'Historical revision unavailable.');
            const draft = { ...structuredClone(s), id: uid('draft'), title: source.title, summary: source.summary, difficulty: source.difficulty, duration: source.duration, status: 'draft', revision: 'Draft 1', validation: 'stale', version: 1, expert: s.expert === 'none' ? 'none' : 'derived' };
            d.scenarios.push(draft);
            w.authors[draft.id] = { definition: structuredClone(source.definition), history: [], base: structuredClone(source), checks: [], releaseNotes: '' };
            w.authors[draft.id].history.push(snapshot(draft, w.authors[draft.id], 'Created from preserved revision'));
            return true;
        }
        if (s.status !== 'draft')
            fail('IMMUTABLE', 'Create a draft fork to change published content.');
        version(s.version);
        const touch = (reason) => { s.version++; s.validation = 'stale'; a.validatedDigest = undefined; a.dryRun = undefined; a.history.push(snapshot(s, a, reason)); s.roles = a.definition.entities.filter(e => e.kind === 'human_role').map(e => e.name); s.objectives = a.definition.objectives.map(o => o.title); };
        if (type === 'scenario.save') {
            s.title = required('title');
            s.summary = required('summary');
            if (p.duration !== undefined)
                s.duration = number(p.duration, 5);
            if (p.difficulty)
                s.difficulty = required('difficulty');
            if (p.bindings !== undefined)
                a.definition.bindings = list(p.bindings);
            if (p.clock)
                a.definition.clock = p.clock === 'realtime' ? 'realtime' : 'stepped';
            if (p.termination !== undefined)
                a.definition.termination = number(p.termination, 5);
            touch('Brief/context updated');
        }
        else if (type === 'scenario.entity') {
            const kind = required('kind');
            if (!['human_role', 'environment_actor', 'threat_actor', 'service'].includes(kind))
                fail('SCHEMA', 'Choose a registered entity type.');
            if (kind === 'threat_actor' && s.discipline !== 'Incident response')
                fail('SCHEMA', 'This discipline uses environment actors.');
            const item = { id: String(p.itemId || uid('entity')), name: required('name'), kind: kind, knowledge: required('knowledge'), resources: number(p.resources, 0, 100), initial: required('initial') };
            const index = a.definition.entities.findIndex(e => e.id === item.id);
            if (index < 0)
                a.definition.entities.push(item);
            else
                a.definition.entities[index] = item;
            touch('Entity definition updated');
        }
        else if (type === 'scenario.transition') {
            const action = required('action');
            if (!allowedActions(s.discipline).includes(action))
                fail('SCHEMA', 'Choose an action registered for this discipline.');
            const t = { id: String(p.itemId || uid('transition')), name: required('name'), action: action, roleId: required('roleId'), targetId: required('targetId'), from: required('from'), to: required('to'), cost: number(p.cost, 0, 100) };
            const index = a.definition.transitions.findIndex(e => e.id === t.id);
            if (index < 0)
                a.definition.transitions.push(t);
            else
                a.definition.transitions[index] = t;
            touch('Registered transition updated');
        }
        else if (type === 'scenario.inject') {
            const trigger = required('trigger'), channel = required('channel');
            if (!['manual', 'time', 'condition'].includes(trigger) || !['internal', 'customer', 'vendor', 'media'].includes(channel))
                fail('SCHEMA', 'Unsupported trigger or channel.');
            const i = { id: String(p.itemId || uid('inject')), title: required('title'), body: required('body'), notes: String(p.notes || ''), trigger: trigger, minute: number(p.minute), condition: String(p.condition || ''), channel: channel, audiences: list(p.audiences), artifact: String(p.artifact || '') };
            if (!i.audiences.length)
                fail('VALIDATION', 'Choose a role audience.');
            const index = a.definition.injects.findIndex(e => e.id === i.id);
            if (index < 0)
                a.definition.injects.push(i);
            else
                a.definition.injects[index] = i;
            touch('Inject/content updated');
        }
        else if (type === 'scenario.objective') {
            const o = { id: String(p.itemId || uid('objective')), title: required('title'), roleId: required('roleId'), start: number(p.start), end: number(p.end), evidence: required('evidence'), anchors: [required('anchor0'), required('anchor1'), required('anchor2'), required('anchor3')], weight: number(p.weight, 0.01, 100), threshold: number(p.threshold, 0, 100), exclusions: required('exclusions') };
            const index = a.definition.objectives.findIndex(e => e.id === o.id);
            if (index < 0)
                a.definition.objectives.push(o);
            else
                a.definition.objectives[index] = o;
            touch('Opportunity/rubric updated');
        }
        else if (type === 'scenario.remove') {
            const item = required('itemId'), collection = required('collection');
            if (collection === 'entities' && (a.definition.transitions.some(t => t.roleId === item || t.targetId === item) || a.definition.objectives.some(o => o.roleId === item) || a.definition.injects.some(i => i.audiences.includes(item))))
                fail('DEPENDENCIES', 'Remove or reassign dependent transitions, inject audiences, and objectives first.');
            if (collection === 'transitions' && a.definition.injects.some(i => i.condition === item))
                fail('DEPENDENCIES', 'A conditional inject references this transition. Reassign it first.');
            if (!['entities', 'transitions', 'injects', 'objectives'].includes(collection))
                fail('SCHEMA', 'Unknown collection.');
            const key = collection;
            a.definition[key] = a.definition[key].filter(e => e.id !== item);
            touch('Object removed after impact review');
        }
        else if (type === 'scenario.proposal') {
            a.proposal = { title: required('title'), summary: required('summary'), status: 'proposed', baseDigest: authorDigest(s, a) };
        }
        else if (type === 'scenario.proposal-accept' || type === 'scenario.proposal-reject') {
            if (!a.proposal || a.proposal.status !== 'proposed')
                fail('INVALID_STATE', 'No pending proposal.');
            if (type.endsWith('accept')) {
                if (a.proposal.baseDigest !== authorDigest(s, a))
                    fail('CONFLICT', 'The proposal base changed. Recreate the proposal against this revision.');
                s.title = a.proposal.title;
                s.summary = a.proposal.summary;
                a.proposal.status = 'accepted';
                touch('Proposal explicitly accepted');
            }
            else
                a.proposal.status = 'rejected';
        }
        else if (type === 'scenario.validate') {
            a.checks = validation(s, a, d);
            s.validation = a.checks.some(c => c.severity === 'blocker') ? 'invalid' : 'valid';
            a.validatedDigest = s.validation === 'valid' ? authorDigest(s, a) : undefined;
        }
        else if (type === 'scenario.dry-run') {
            if (a.validatedDigest !== authorDigest(s, a))
                fail('VALIDATION_REQUIRED', 'Validate the current digest first.');
            const states = Object.fromEntries(a.definition.entities.map(e => [e.id, e.initial]));
            const trace = ['Isolated local simulation; no participant observations or metrics are written.'];
            for (const i of a.definition.injects)
                trace.push(`${i.minute}m · ${i.trigger} cue · ${i.title} · ${i.audiences.join(', ')}`);
            for (let step = 0; step < Math.min(a.definition.transitions.length, 100); step++) {
                const t = a.definition.transitions[step];
                if (states[t.targetId] === t.from) {
                    states[t.targetId] = t.to;
                    trace.push(`Registered ${t.action}: ${t.from} → ${t.to}`);
                }
                else
                    trace.push(`${t.name}: prerequisite ${t.from} unmet`);
            }
            trace.push(`${a.definition.objectives.length} defined opportunities; eligibility still requires human review.`);
            a.dryRun = { digest: authorDigest(s, a), trace, state: 'complete' };
        }
        else if (type === 'scenario.dry-cancel') {
            if (a.dryRun)
                a.dryRun.state = 'canceled';
        }
        else if (type === 'scenario.publish') {
            if (a.validatedDigest !== authorDigest(s, a) || s.validation !== 'valid')
                fail('VALIDATION_REQUIRED', 'Validation is stale or blocked.');
            if (p.digest !== authorDigest(s, a))
                fail('CONFLICT', 'The preview digest changed. Review publication again.');
            a.releaseNotes = required('releaseNotes');
            s.status = 'published';
            s.revision = `1.${s.version}`;
            a.history.push(snapshot(s, a, 'Immutable organization publication'));
        }
        else
            return false;
        return true;
    }
    if (type.startsWith('exercise.') || type.startsWith('session.') || type.startsWith('inject.') || type.startsWith('adjudication.') || type.startsWith('handoff.') || type === 'decision.revise' || type === 'reflection.save' || type === 'message.reconcile') {
        const s = d.sessions.find(s => s.id === id || s.exerciseId === id);
        if (type === 'exercise.schedule')
            return false;
        if (!s)
            fail('UNAVAILABLE', 'Assigned session unavailable.');
        const x = w.exercises[s.id];
        version(x.version);
        const active = () => { if (s.status !== 'running')
            fail('PAUSED', 'This operation requires a running session.'); };
        const event = (title, detail, kind = 'system') => appendEvent(d, s.id, title, detail, kind);
        if (type === 'exercise.fixture-ready') {
            need('facilitate');
            if (!['scheduled', 'lobby'].includes(s.status))
                fail('LOCKED', 'This fixture control is available only before launch.');
            for (const r of x.roster) {
                r.ready = true;
                r.disclosed = true;
            }
            x.version++;
        }
        else if (type === 'exercise.configure') {
            need('facilitate');
            if (!['draft', 'scheduled', 'lobby'].includes(s.status))
                fail('LOCKED', 'Configuration is locked after launch.');
            s.title = required('title');
            const when = required('when');
            if (!Number.isFinite(Date.parse(when)))
                fail('VALIDATION', 'Invalid date and timezone offset.');
            s.when = new Date(when).toISOString();
            s.owner = required('facilitator');
            s.duration = number(p.duration, 5);
            x.meeting = String(p.meeting || '');
            if (x.meeting && !/^https?:\/\//.test(x.meeting))
                fail('VALIDATION', 'Use an HTTP(S) meeting URL.');
            x.timezone = required('timezone');
            try {
                new Intl.DateTimeFormat('en', { timeZone: x.timezone });
            }
            catch {
                fail('VALIDATION', 'Invalid IANA timezone.');
            }
            x.objectives = list(p.objectives);
            if (!x.objectives.length || x.objectives.some(id => !x.pinned?.definition.objectives.some(o => o.id === id)))
                fail('VALIDATION', 'Choose existing pinned objectives.');
            x.baseline = String(p.baseline || '');
            if (p.lifecycle === 'scheduled' && s.status === 'draft')
                s.status = 'scheduled';
            x.version++;
        }
        else if (type === 'exercise.assign') {
            need('facilitate');
            if (!['draft', 'scheduled', 'lobby'].includes(s.status))
                fail('LOCKED', 'Roster is pinned at launch.');
            const person = d.people.find(e => e.id === required('person'));
            if (!person)
                fail('UNVERIFIED', 'Only existing verified fixture identities can be assigned.');
            const role = required('role');
            if (role !== 'observer' && !x.pinned?.definition.entities.some(e => e.id === role && e.kind === 'human_role'))
                fail('SCHEMA', 'Choose a defined role.');
            x.roster = x.roster.filter(r => r.id !== person.id);
            x.roster.push({ id: person.id, name: person.name, role, observer: role === 'observer', verified: true, ready: false, disclosed: false });
            x.version++;
        }
        else if (type === 'exercise.unassign') {
            need('facilitate');
            if (!['draft', 'scheduled', 'lobby'].includes(s.status))
                fail('LOCKED', 'Roster is pinned at launch.');
            x.roster = x.roster.filter(r => r.id !== required('person'));
            x.version++;
        }
        else if (type === 'session.open') {
            need('facilitate');
            if (s.status !== 'scheduled')
                fail('INVALID_STATE', 'Only scheduled sessions can open the lobby.');
            s.status = 'lobby';
            event('Lobby opened', 'Participants may review assignments and acknowledge disclosure.');
        }
        else if (type === 'session.join') {
            if (!['lobby', 'running', 'paused'].includes(s.status))
                fail('INVALID_STATE', 'Wait until the lobby opens.');
            const r = x.roster.find(r => r.id === 'p-self');
            if (!r && !['observer', 'guest'].includes(scope.persona))
                fail('MISSING_ROLE', 'Request an assignment from the facilitator.');
            if (p.disclosure !== 'yes')
                fail('DISCLOSURE_REQUIRED', 'Acknowledge the participation disclosure.');
            if (r) {
                r.disclosed = true;
                r.ready = true;
            }
            event('Participant acknowledged disclosure', s.status === 'running' ? 'Late join receives current permitted history; no actions replayed.' : 'Readiness recorded; role permissions unchanged.');
        }
        else if (type === 'session.start') {
            need('facilitate');
            if (s.status !== 'lobby')
                fail('INVALID_STATE', 'Open the lobby before launch.');
            const pack = d.scenarios.find(a => a.id === s.scenarioId);
            if (!pack || pack.status !== 'published' || !pack.available)
                fail('ENTITLEMENT_REQUIRED', 'A licensed publication is required at launch.');
            const a = w.authors[pack.id];
            const requiredRoles = a.definition.objectives.filter(o => x.objectives.includes(o.id)).map(o => o.roleId);
            if (!x.objectives.length || x.objectives.some(id => !a.definition.objectives.some(o => o.id === id)))
                fail('PREFLIGHT', 'Select existing opportunities before launch.');
            if (requiredRoles.some(role => !x.roster.some(r => r.role === role && r.verified && r.ready && r.disclosed)))
                fail('PREFLIGHT', 'Every selected opportunity needs a ready, disclosed role assignment.');
            x.pinned = snapshot(pack, a, 'Launch-time pinned definition');
            s.revision = pack.revision;
            x.world = Object.fromEntries(a.definition.entities.map(e => [e.id, e.initial]));
            x.injects = a.definition.injects.map(i => ({ definition: structuredClone(i), state: 'queued', minute: i.minute }));
            s.status = 'running';
            event('Exercise started', 'Launch revision and policy pinned.');
        }
        else if (type === 'session.pause' || type === 'session.resume' || type === 'session.end' || type === 'session.cancel' || type === 'session.archive') {
            need('facilitate');
            if (type === 'session.pause') {
                active();
                s.status = 'paused';
            }
            else if (type === 'session.resume') {
                if (s.status !== 'paused')
                    fail('INVALID_STATE', 'Session is not paused.');
                s.status = 'running';
            }
            else if (type === 'session.end') {
                if (!['running', 'paused'].includes(s.status))
                    fail('INVALID_STATE', 'Only active sessions can end.');
                s.status = 'ended';
                x.assessmentImpact.push(`Session ended · ${required('rationale')}`);
            }
            else if (type === 'session.cancel') {
                if (!['draft', 'scheduled', 'lobby'].includes(s.status))
                    fail('INVALID_STATE', 'Only prelaunch sessions can be canceled.');
                s.status = 'canceled';
                required('rationale');
            }
            else {
                if (!['ended', 'review'].includes(s.status))
                    fail('INVALID_STATE', 'Complete the session before archiving.');
                s.status = 'archived';
            }
            event(type.replace('session.', 'Session '), String(p.rationale || 'Lifecycle transition recorded.'));
        }
        else if (type === 'session.step') {
            need('facilitate');
            active();
            if (x.clock !== 'stepped')
                fail('CLOCK_POLICY', 'Manual stepping is unavailable for this clock policy.');
            const next = minutes(s.simulationTime) + number(p.minutes, 1, 60);
            if (next > (x.pinned?.definition.termination || 480))
                fail('TERMINATION', 'This step exceeds the pinned termination window. End the exercise explicitly.');
            s.simulationTime = clock(next);
            event('Clock advanced', `Facilitator stepped ${p.minutes} simulation minutes.`);
        }
        else if (type === 'inject.release' || type === 'inject.delay' || type === 'inject.cancel') {
            need('facilitate');
            active();
            const i = x.injects.find(i => i.definition.id === required('inject'));
            if (!i || i.state !== 'queued')
                fail('INVALID_STATE', 'Inject is not queued.');
            if (type === 'inject.release') {
                if (i.definition.trigger === 'time' && minutes(s.simulationTime) < i.minute)
                    fail('NOT_ELIGIBLE', 'The simulation deadline has not been reached.');
                if (i.definition.trigger === 'condition' && !x.events.some(e => e.kind === i.definition.condition))
                    fail('NOT_ELIGIBLE', 'The registered condition has not executed.');
                i.state = 'released';
                if (i.definition.artifact)
                    d.evidence.push({ id: uid('artifact'), sessionId: s.id, audiences: i.definition.audiences, title: i.definition.title, type: 'document', time: s.simulationTime, version: '1', source: 'Released synthetic scenario artifact', content: i.definition.artifact, downloadable: true });
                appendEvent(d, s.id, i.definition.title, i.definition.body, 'inject', i.definition.audiences);
                x.messages.push({ id: uid('msg'), source: 'Synthetic scenario actor', thread: i.definition.channel, text: i.definition.body, minute: minutes(s.simulationTime), attachment: i.definition.artifact, status: 'delivered', audiences: [...i.definition.audiences] });
            }
            else if (type === 'inject.delay') {
                i.minute += number(p.minutes, 1, 60);
                x.assessmentImpact.push(`Inject delayed: ${i.definition.title} · ${required('rationale')}`);
            }
            else {
                i.state = 'canceled';
                x.assessmentImpact.push(`Inject canceled: ${i.definition.title} · ${required('rationale')}`);
            }
            event(type, 'Pinned criteria unchanged; pacing change recorded.');
        }
        else if (type === 'inject.manual') {
            need('facilitate');
            active();
            const audience = required('audience');
            if (!x.roster.some(r => r.role === audience))
                fail('FORBIDDEN', 'Audience is not assigned.');
            const text = required('message');
            if (text.length > 2000)
                fail('LIMIT', 'Manual messages are limited to 2,000 characters.');
            appendEvent(d, s.id, 'Facilitator manual cue', text, 'manual', [audience]);
            x.assessmentImpact.push(`Manual cue · ${required('rationale')}`);
        }
        else if (type === 'adjudication.request') {
            need('command');
            active();
            x.requests.push({ id: uid('request'), intent: required('intent'), state: 'pending' });
        }
        else if (type === 'adjudication.resolve') {
            need('facilitate');
            active();
            const request = x.requests.find(r => r.id === required('request'));
            if (!request || request.state !== 'pending')
                fail('CONFLICT', 'Request is already resolved or unavailable.');
            const result = required('resolution'), rationale = required('rationale');
            if (!['clarify', 'reject', 'compensate'].includes(result))
                fail('SCHEMA', 'Choose a bounded resolution.');
            if (result === 'compensate') {
                const transition = x.pinned?.definition.transitions.find(t => t.id === required('transition'));
                if (!transition || x.world[transition.targetId] !== transition.from)
                    fail('PREREQUISITE', 'Registered precondition is unmet.');
                const budget = Number(x.world[`${transition.targetId}:budget`] ?? x.pinned.definition.entities.find(e => e.id === transition.targetId)?.resources ?? 0);
                if (budget < transition.cost)
                    fail('RESOURCE_LIMIT', 'Compensation exceeds the pinned resource envelope.');
                x.world[`${transition.targetId}:budget`] = String(budget - transition.cost);
                x.world[transition.targetId] = transition.to;
                x.assessmentImpact.push(required('impact'));
                event(`Compensating event: ${transition.name}`, rationale, transition.id);
            }
            else
                event(`Adjudication: ${result}`, rationale);
            request.state = 'resolved';
            request.resolution = result;
            request.rationale = rationale;
        }
        else if (type === 'adjudication.glasshouse-evidence') {
            need('facilitate');
            active();
            if (!x.pinned?.definition.entities.some(e => e.id === 'chorus'))
                fail('SCHEMA', 'This evidence adapter is for GLASSHOUSE only.');
            const evidence = glasshouseEvidence.find(e => e.id === required('evidence')), action = glasshouseActions.find(a => a.id === required('action')), request = x.requests.find(r => r.id === required('request'));
            if (!evidence || !action || !evidence.actions.includes(action.id))
                fail('SCHEMA', 'Choose a matching investigation action and evidence source.');
            if (minutes(s.simulationTime) < evidence.minute)
                fail('NOT_ELIGIBLE', 'This evidence is not yet available on the exercise clock.');
            const investigator = x.roster.find(r => r.id === required('investigator'));
            if (!investigator || !investigator.verified || investigator.observer || !action.roles.includes(investigator.role))
                fail('FORBIDDEN', 'The investigator must hold an eligible assigned role.');
            if (!request || request.state !== 'pending' || !request.intent.includes(action.id))
                fail('REQUEST_REQUIRED', 'A pending attributed request naming this action ID is required.');
            if (p.authorized !== 'yes')
                fail('APPROVAL_REQUIRED', 'Explicit facilitator authorization is required; no approval is inferred from discussion.');
            if (d.evidence.some(e => e.sessionId === s.id && e.source === `GLASSHOUSE investigation ${evidence.id}`))
                fail('ALREADY_RELEASED', 'This evidence has already been released.');
            const rationale = required('rationale');
            d.evidence.push({ id: uid('gh-evidence'), sessionId: s.id, audiences: x.roster.filter(r => !r.observer).map(r => r.role), title: evidence.title, type: 'document', time: s.simulationTime, version: '1', source: `GLASSHOUSE investigation ${evidence.id}`, content: evidence.answer + '\n\nAuthorized synthetic investigation: ' + action.name + '\nInvestigator: ' + investigator.name + '\nFacilitator rationale: ' + rationale, downloadable: true });
            request.state = 'resolved';
            request.resolution = 'clarify';
            request.rationale = rationale;
            event('Investigation evidence released', `${evidence.title} · ${action.id} · authorized investigator ${investigator.name}. Evidence released, no world-state or rubric score inferred.`);
            x.assessmentImpact.push(`Authorized evidence reveal ${evidence.id}: ${rationale}. Simulated action cost ${action.minutes}m; advance the clock explicitly.`);
        }
        else if (type === 'adjudication.observe') {
            need('facilitate');
            const objective = x.pinned?.definition.objectives.find(o => o.id === required('objective'));
            if (!objective)
                fail('SCHEMA', 'Choose a pinned opportunity.');
            const level = String(p.level);
            if (!['0', '1', '2', '3'].includes(level))
                fail('RUBRIC', 'Choose an observed rubric level from 0 to 3.');
            const subject = required('subject'), evidence = list(p.evidence);
            if (subject !== 'Team' && !x.roster.some(r => r.id === subject && !r.observer))
                fail('SCHEMA', 'Choose an assigned participant or Team.');
            if (!evidence.length || evidence.some(id => !d.evidence.some(e => e.id === id && e.sessionId === s.id)))
                fail('MISSING_EVIDENCE', 'Cite released evidence from this session.');
            const fid = uid('finding');
            d.findings.push({ id: fid, title: objective.title, subject: required('subject'), status: 'draft', level: Number(p.level), evidence: list(p.evidence), opportunity: objective.id, claim: required('claim'), attribution: `Facilitator-recorded verbal observation: ${required('attribution')}`, reviewer: 'Unassigned', version: 1 });
            w.findings[fid] = { sessionId: s.id, inspected: [], history: [{ version: 1, state: 'draft', claim: String(p.claim), reason: 'Attributed verbal observation; requires review' }] };
            event('Facilitator observation captured', 'Draft observation recorded with source and attribution.');
        }
        else if (type === 'decision.revise') {
            need('command');
            active();
            const previous = x.decisions.find(r => r.id === required('decision'));
            if (!previous || previous.state !== 'committed')
                fail('CONFLICT', 'Decision was already superseded.');
            previous.state = 'superseded';
            x.decisions.push({ ...structuredClone(previous), id: uid('decision'), rationale: required('rationale'), state: 'committed', previous: previous.id });
            event('Decision revised', String(p.rationale));
        }
        else if (type === 'handoff.propose' || type === 'handoff.acknowledge' || type === 'handoff.complete') {
            need('command');
            active();
            if (type === 'handoff.propose') {
                const owner = required('owner');
                if (!x.roster.some(r => r.id === owner && !r.observer))
                    fail('SCHEMA', 'Choose an assigned participant owner.');
                x.handoffs.push({ id: uid('handoff'), task: required('task'), owner, state: 'proposed' });
            }
            else {
                const h = x.handoffs.find(h => h.id === required('handoff'));
                if (!h)
                    fail('UNAVAILABLE', 'Handoff unavailable.');
                if (h.owner !== 'p-self' && !['manager', 'consultant'].includes(scope.persona))
                    fail('FORBIDDEN', 'Only the assignee can acknowledge this handoff.');
                if (type === 'handoff.complete' && h.state !== 'acknowledged')
                    fail('INVALID_STATE', 'Acknowledge before completing.');
                h.state = type === 'handoff.complete' ? 'complete' : 'acknowledged';
            }
            event('Handoff updated', 'Named responsibility updated; no performance score inferred.');
        }
        else if (type === 'reflection.save') {
            if (!['ended', 'review', 'archived'].includes(s.status))
                fail('INVALID_STATE', 'Reflections open after completion.');
            x.reflections.push({ subject: scope.persona === 'manager' ? 'Facilitator' : 'p-self', text: required('reflection') });
        }
        else if (type === 'message.reconcile') {
            need('command');
            const msg = x.messages.find(r => r.id === required('message'));
            if (!msg)
                fail('UNAVAILABLE', 'Message receipt unavailable.');
            msg.status = 'delivered';
        }
        else
            return false;
        x.version++;
        return true;
    }
    if (type.startsWith('finding.') || type.startsWith('report.')) {
        if (type.startsWith('finding.')) {
            const f = d.findings.find(f => f.id === id);
            if (!f)
                fail('UNAVAILABLE', 'Finding unavailable.');
            const state = w.findings[id];
            version(f.version);
            if (type === 'finding.inspect') {
                need('review');
                const evidence = required('evidence');
                if (!f.evidence.includes(evidence))
                    fail('FORBIDDEN', 'This evidence is not cited by the finding.');
                if (!state.inspected.includes(evidence))
                    state.inspected.push(evidence);
                return true;
            }
            if (type === 'finding.challenge') {
                need('profile', f.subject);
                f.challenge = required('rationale');
                f.status = 'disputed';
            }
            else {
                need('review');
                if (type === 'finding.approve') {
                    if (!f.evidence.length || !Number.isInteger(f.level) || Number(f.level) < 0 || Number(f.level) > 3 || !f.opportunity || f.status === 'disputed' || f.evidence.some(id => !state.inspected.includes(id) || !d.evidence.some(e => e.id === id)))
                        fail('MISSING_EVIDENCE', 'Inspect every available citation and resolve attribution before approval.');
                    f.status = 'approved';
                    f.reviewer = 'Casey Morgan';
                }
                else if (type === 'finding.amend') {
                    f.claim = required('claim');
                    f.attribution = required('attribution');
                    f.evidence = list(p.evidence);
                    const level = required('level');
                    if (!['0', '1', '2', '3', 'not_observed', 'not_applicable'].includes(level))
                        fail('RUBRIC', 'Invalid rubric level.');
                    f.level = /^[0-3]$/.test(level) ? Number(level) : level;
                    f.status = 'draft';
                    state.inspected = [];
                    required('rationale');
                }
                else if (type === 'finding.reject') {
                    f.status = 'corrected';
                    state.resolution = `Rejected: ${required('rationale')}`;
                }
                else if (type === 'finding.resolve') {
                    if (f.status !== 'disputed')
                        fail('INVALID_STATE', 'No disputed correction is pending.');
                    const outcome = required('outcome');
                    if (!['accept', 'reject'].includes(outcome))
                        fail('VALIDATION', 'Choose accept or reject.');
                    state.resolution = `Correction ${outcome}ed: ${required('rationale')}`;
                    if (outcome === 'accept') {
                        f.claim = required('claim');
                        f.status = 'draft';
                        state.inspected = [];
                    }
                    else
                        f.status = 'draft';
                }
                else
                    return false;
            }
            f.version++;
            state.history.push({ version: f.version, state: f.status, claim: f.claim, reason: String(p.rationale || state.resolution || 'Evidence reviewed') });
            for (const r of d.reports.filter(r => r.findingIds.includes(id))) {
                const rs = w.reports[r.id];
                if (['published', 'superseded', 'withdrawn'].includes(r.status))
                    rs.needsAmendment.push(`Finding ${id} changed at revision ${f.version}`);
                else {
                    r.status = 'draft';
                    rs.approval = undefined;
                }
            }
            return true;
        }
        need('review');
        if (type === 'report.create') {
            const session = d.sessions.find(s => s.id === required('session'));
            if (!session || !['ended', 'review', 'archived'].includes(session.status))
                fail('INVALID_STATE', 'Complete the exercise before composing its report.');
            const rid = uid('report');
            d.reports.push({ id: rid, title: required('title'), type: required('reportType'), revision: '0.1', status: 'draft', audience: 'Review team', date: new Date().toISOString(), findingIds: d.findings.filter(f => w.findings[f.id]?.sessionId === session.id && f.status === 'approved').map(f => f.id), summary: 'Draft narrative. Review evidence and limitations before approval.', version: 1 });
            workflows(d).reports[rid].sessionId = session.id;
            return true;
        }
        const r = d.reports.find(r => r.id === id);
        if (!r)
            fail('UNAVAILABLE', 'Report unavailable.');
        const state = w.reports[id];
        version(r.version);
        if (type === 'report.amend') {
            if (!['published', 'superseded', 'withdrawn'].includes(r.status))
                fail('INVALID_STATE', 'Amend a published revision.');
            const next = { ...structuredClone(r), id: uid('report'), revision: `${Number.parseInt(r.revision) + 1}.0`, status: 'draft', version: 1 };
            d.reports.push(next);
            w.reports[next.id] = { sections: structuredClone(state.sections), history: [], amends: r.id, sessionId: state.sessionId, needsAmendment: [] };
            return true;
        }
        if (type === 'report.withdraw') {
            if (r.status !== 'published')
                fail('INVALID_STATE', 'Only published reports can be withdrawn.');
            state.withdrawal = required('rationale');
            r.status = 'withdrawn';
            for (const snap of state.history)
                snap.status = 'withdrawn';
            r.version++;
            return true;
        }
        if (['published', 'superseded', 'withdrawn'].includes(r.status))
            fail('IMMUTABLE', 'Published revisions need an amendment.');
        if (type === 'report.save') {
            r.title = p.title ? required('title') : r.title;
            r.summary = required('summary');
            const audience = String(p.audience || r.audience);
            if (!['Program members', 'Review team', 'Participant self'].includes(audience))
                fail('AUDIENCE', 'Choose a permitted audience.');
            r.audience = audience;
            if (p.findings !== undefined)
                r.findingIds = list(p.findings);
            if (p.sections) {
                const sections = JSON.parse(String(p.sections));
                if (!Array.isArray(sections) || !sections.length || sections.length > 20 || sections.some(s => !s || typeof s.title !== 'string' || typeof s.body !== 'string' || !['Program members', 'Review team', 'Participant self'].includes(s.audience)))
                    fail('SCHEMA', 'Invalid report sections.');
                state.sections = sections.map(s => ({ id: String(s.id || uid('section')), title: s.title, body: s.body, audience: s.audience }));
            }
            else
                state.sections[0].body = r.summary;
            r.status = 'draft';
            state.approval = undefined;
        }
        else if (type === 'report.submit') {
            r.status = 'in_review';
            state.approval = undefined;
        }
        else if (type === 'report.approve') {
            if (r.findingIds.some(id => { const f = d.findings.find(f => f.id === id); return !f || f.status !== 'approved' || !f.evidence.length || !!state.sessionId && w.findings[id]?.sessionId !== state.sessionId; }))
                fail('UNAPPROVED_FINDING', 'Every included finding requires approved evidence.');
            if (r.audience === 'Program members' && r.findingIds.some(id => d.findings.find(f => f.id === id)?.subject !== 'Team'))
                fail('PRIVACY', 'A program report cannot include private individual observations.');
            if (p.digest !== reportDigest(d, id))
                fail('CONFLICT', 'Report content or audience changed after preview.');
            state.approval = { digest: reportDigest(d, id), reviewer: 'Casey Morgan' };
            r.status = 'approved';
        }
        else if (type === 'report.publish') {
            if (r.status !== 'approved' || state.approval?.digest !== reportDigest(d, id))
                fail('APPROVAL_REQUIRED', 'Approve the exact current content and audience.');
            if (p.digest !== reportDigest(d, id))
                fail('CONFLICT', 'Publication preview is stale.');
            r.date = new Date().toISOString();
            r.status = 'published';
            state.history.push(reportSnapshot(d, id, state.approval.reviewer));
            if (state.amends) {
                const previous = d.reports.find(r => r.id === state.amends);
                if (previous) {
                    previous.status = 'superseded';
                    for (const snap of w.reports[previous.id].history)
                        snap.status = 'superseded';
                }
            }
        }
        else
            return false;
        r.version++;
        return true;
    }
    return false;
}
