import { href } from './view-context.js';
import { workflows } from './workflow-model.js';
import { escape as e, icon, button, link, field, applyTitleCase } from './ui.js';
export function scenarioGraph(c) {
    const s = c.data.scenarios.find(s => s.id === c.params.scenarioId);
    const d = workflows(c.data).authors[s.id].definition;
    const nodes = [{ id: 'overview', kind: 'overview', title: s.title, detail: s.summary, x: 340, y: 32, edit: href(c, 'AUT-02') }];
    d.transitions.forEach((t, i) => nodes.push({ id: 'transition:' + t.id, kind: 'transition', title: t.name, detail: `${t.roleId} → ${t.targetId}\n${t.from} → ${t.to} · ${t.action}`, x: 32 + (i % 3) * 308, y: 210 + Math.floor(i / 3) * 180, edit: href(c, 'AUT-03', {}, { worldTab: 'transitions', transition: t.id }) }));
    const start = 230 + Math.ceil(d.transitions.length / 3) * 180;
    d.injects.forEach((i, n) => nodes.push({ id: 'inject:' + i.id, kind: 'inject', title: i.title, detail: `${i.trigger} · ${i.minute}m · ${i.channel}\n${i.body}`, x: 32 + (n % 3) * 308, y: start + Math.floor(n / 3) * 190, edit: i.id }));
    const height = Math.max(430, start + Math.ceil(d.injects.length / 3) * 190), edges = [];
    for (const node of nodes.filter(n => n.kind === 'transition'))
        edges.push(edge(nodes[0], node, false));
    for (const i of d.injects) {
        const node = nodes.find(n => n.id === 'inject:' + i.id);
        const parent = i.trigger === 'condition' ? nodes.find(n => n.id === 'transition:' + i.condition) : nodes[0];
        if (parent)
            edges.push(edge(parent, node, i.trigger === 'condition'));
    }
    return `<section class="panel graph-workspace" data-scenario-graph data-draft-key="${e(c.scope.tenant + ':' + c.scope.persona + ':' + s.id)}"><header class="panel-head"><div><h2>Scenario graph</h2><p class="meta">${d.injects.length} injects · ${d.transitions.length} registered transitions</p></div><div class="row-actions">${link('List view', href(c, 'AUT-04', {}, { view: 'list' }), 'secondary')}${s.status === 'draft' ? button('Add Inject', 'author-editor', 'primary', 'data-kind="inject"') : ''}</div></header><div class="graph-toolbar"><div class="row-actions"><button type="button" class="btn secondary" data-graph-zoom="out" aria-label="Zoom out">−</button><output data-graph-scale aria-live="polite">100%</output><button type="button" class="btn secondary" data-graph-zoom="in" aria-label="Zoom in">+</button><button type="button" class="btn secondary" data-graph-zoom="fit">Fit graph</button><button type="button" class="btn secondary" data-graph-zoom="reset">Reset View</button><button type="button" class="btn secondary" data-graph-zoom="layout">Reset Layout</button></div><span class="meta">Drag canvas to pan · Drag nodes to arrange · Click to inspect · Shift-click to target</span></div><div class="graph-layout"><div class="graph-viewport" tabindex="0" aria-label="Scenario graph canvas. Drag blank space to pan, or scroll to explore. Drag nodes to arrange them. Select a node to inspect it."><div class="graph-space" style="width:960px;height:${height}px"><div class="graph-plane" style="width:960px;height:${height}px"><svg class="graph-edges" viewBox="0 0 960 ${height}" aria-hidden="true"><defs><marker id="graph-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z"/></marker></defs>${edges.join('')}</svg>${nodes.map(n => `<button type="button" class="graph-node" data-node="${e(n.id)}" aria-pressed="false" title="Drag to move; click to inspect. Alt + Arrow keys move this node; add Shift for larger steps." style="left:${n.x}px;top:${n.y}px"><span class="graph-node-kind">${icon(n.kind === 'overview' ? 'report' : n.kind === 'inject' ? 'scenario' : 'action')}${n.kind === 'transition' ? 'Registered option / transition' : n.kind}</span><strong>${e(n.title)}</strong><span class="graph-node-description">${e(n.detail)}</span></button>`).join('')}</div></div></div><aside class="graph-inspector" aria-label="Node inspector"><h3>Node details</h3><div data-graph-inspector aria-live="polite"><p class="muted">Select an overview, transition, or inject to inspect its definition.</p></div><div class="divider"></div><h3>Targeted change request</h3><p class="meta">Generate a reviewed AI proposal for the overview or an inject. Requests send this selected scenario context to OpenAI; saving a local request makes no API call.</p><label class="graph-target-label" for="graph-target">Target node</label><select id="graph-target" data-graph-target><option value="">Choose a node…</option>${nodes.map(n => `<option value="${e(n.id)}">${e(n.kind + ' · ' + n.title)}</option>`).join('')}</select>${field('graph-request', 'Requested change', '', undefined, 'AI suggests narrative changes only. Inspect and accept a proposal before it changes this draft.', false, 'textarea')}<button type="button" class="btn secondary" data-graph-save ${s.status !== 'draft' ? 'disabled' : ''}>Save local request</button><div class="row-actions"><button type="button" class="btn primary" data-action="ai-generate" ${s.status !== 'draft' ? 'disabled' : ''}>Generate AI Proposal</button><button type="button" class="btn secondary" data-action="ai-history">AI History</button></div><p class="meta" data-graph-status role="status"></p></aside></div><footer class="graph-legend"><span><i class="graph-line"></i>Solid arrow: recorded transition condition</span><span><i class="graph-line dashed"></i>Dashed line: overview grouping, not execution order</span><span>Use World & roles to author transitions; Edit Inject to assign a condition.</span></footer><script type="application/json" data-graph-data>${JSON.stringify({ nodes, draft: s.status === 'draft' }).replace(/</g, '\u003c')}</script></section>`;
}
export function graphEdgePath(a, b) { const x = a.x + 136, y = a.y + 136, tx = b.x + 136, ty = b.y; return `M${x},${y} C${x},${(y + ty) / 2} ${tx},${(y + ty) / 2} ${tx},${ty}`; }
function edge(a, b, conditional) { return `<path data-from="${e(a.id)}" data-to="${e(b.id)}" class="${conditional ? 'condition' : 'grouping'}" d="${graphEdgePath(a, b)}" ${conditional ? 'marker-end="url(#graph-arrow)"' : ''}/>`; }
export function mountScenarioGraph(root) {
    const graph = root.querySelector('[data-scenario-graph]');
    if (!graph)
        return;
    const { nodes, draft } = JSON.parse(graph.querySelector('[data-graph-data]').textContent);
    const viewport = graph.querySelector('.graph-viewport'), plane = graph.querySelector('.graph-plane'), space = graph.querySelector('.graph-space'), inspector = graph.querySelector('[data-graph-inspector]'), target = graph.querySelector('[data-graph-target]'), request = graph.querySelector('[name=graph-request]'), status = graph.querySelector('[data-graph-status]');
    let scale = 1, panX = 0, panY = 0;
    const key = 'strata-graph-request:' + graph.dataset.draftKey, layoutKey = 'strata-graph-layout:' + graph.dataset.draftKey;
    const defaults = nodes.map(n => ({ id: n.id, x: n.x, y: n.y })), baseHeight = parseFloat(plane.style.height), svg = graph.querySelector('.graph-edges');
    try {
        const saved = JSON.parse(sessionStorage.getItem(layoutKey) || 'null');
        if (saved && typeof saved === 'object')
            for (const n of nodes) {
                const point = saved[n.id];
                if (point && Number.isFinite(point.x) && Number.isFinite(point.y) && point.x >= 0 && point.y >= 0 && point.x <= 20000 && point.y <= 20000) {
                    n.x = point.x;
                    n.y = point.y;
                }
            }
    }
    catch { }
    const saveLayout = () => { try {
        sessionStorage.setItem(layoutKey, JSON.stringify(Object.fromEntries(nodes.map(n => [n.id, { x: n.x, y: n.y }]))));
    }
    catch {
        status.textContent = 'Layout moved, but browser storage is unavailable.';
    } };
    const draw = () => { const width = Math.max(960, ...nodes.map(n => n.x + 304)), height = Math.max(baseHeight, ...nodes.map(n => n.y + 168)); plane.style.width = width + 'px'; plane.style.height = height + 'px'; plane.style.transform = `translate(${panX}px,${panY}px) scale(${scale})`; space.style.width = `${width * scale + Math.max(0, panX)}px`; space.style.height = `${height * scale + Math.max(0, panY)}px`; svg.setAttribute('viewBox', `0 0 ${width} ${height}`); for (const n of nodes) {
        const el = graph.querySelector(`[data-node="${CSS.escape(n.id)}"]`);
        el.style.left = n.x + 'px';
        el.style.top = n.y + 'px';
    } for (const path of svg.querySelectorAll('path[data-from]')) {
        const a = nodes.find(n => n.id === path.dataset.from), b = nodes.find(n => n.id === path.dataset.to);
        if (a && b)
            path.setAttribute('d', graphEdgePath(a, b));
    } };
    draw();
    try {
        const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
        if (saved) {
            request.value = saved.text;
            target.value = nodes.some(n => n.id === saved.target) ? saved.target : '';
            status.textContent = 'Recovered local change request.';
        }
    }
    catch { }
    const zoom = (value) => { scale = Math.min(1.5, Math.max(.25, value)); draw(); graph.querySelector('output').textContent = Math.round(scale * 100) + '%'; };
    let drag;
    let suppressClick = false;
    viewport.addEventListener('pointerdown', event => { if (event.button !== 0 || event.shiftKey || drag)
        return; const el = event.target.closest('[data-node]'), node = nodes.find(n => n.id === el?.dataset.node); suppressClick = false; drag = { pointer: event.pointerId, node, startX: event.clientX, startY: event.clientY, x: node?.x ?? panX, y: node?.y ?? panY, moved: false }; });
    viewport.addEventListener('pointermove', event => { if (!drag || event.pointerId !== drag.pointer)
        return; const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY; if (!drag.moved && Math.hypot(dx, dy) < 5)
        return; if (!drag.moved)
        viewport.setPointerCapture(event.pointerId); drag.moved = true; viewport.classList.add(drag.node ? 'moving-node' : 'panning'); if (drag.node) {
        drag.node.x = Math.max(0, Math.min(20000, drag.x + dx / scale));
        drag.node.y = Math.max(0, Math.min(20000, drag.y + dy / scale));
    }
    else {
        panX = drag.x + dx;
        panY = drag.y + dy;
    } draw(); event.preventDefault(); });
    const finishDrag = (event) => { if (!drag || event.pointerId !== drag.pointer)
        return; const moved = drag.moved, node = drag.node; drag = undefined; viewport.classList.remove('moving-node', 'panning'); if (viewport.hasPointerCapture(event.pointerId))
        viewport.releasePointerCapture(event.pointerId); if (moved) {
        suppressClick = true;
        if (node)
            saveLayout();
    } };
    viewport.addEventListener('pointerup', finishDrag);
    viewport.addEventListener('pointercancel', finishDrag);
    viewport.addEventListener('lostpointercapture', finishDrag);
    viewport.addEventListener('click', event => { if (suppressClick && event.detail !== 0) {
        event.preventDefault();
        event.stopPropagation();
    } suppressClick = false; }, true);
    viewport.addEventListener('keydown', event => { const el = event.target.closest('[data-node]'); if (!el || !event.altKey || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key))
        return; event.preventDefault(); const n = nodes.find(n => n.id === el.dataset.node), step = event.shiftKey ? 50 : 10; n.x = Math.max(0, Math.min(20000, n.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0))); n.y = Math.max(0, Math.min(20000, n.y + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0))); draw(); saveLayout(); status.textContent = 'Node layout moved. Scenario logic is unchanged.'; });
    graph.addEventListener('click', event => {
        const el = event.target.closest('[data-node],[data-graph-zoom],[data-graph-save]');
        if (!el)
            return;
        if (el.dataset.node) {
            const n = nodes.find(n => n.id === el.dataset.node);
            graph.querySelectorAll('[data-node]').forEach(b => b.setAttribute('aria-pressed', String(b === el)));
            inspector.innerHTML = `<span class="badge info">${e(n.kind)}</span><h3>${e(n.title)}</h3><p class="graph-detail">${e(n.detail)}</p>${n.kind === 'inject' ? (draft ? button('Edit Inject', 'author-editor', 'primary', `data-kind="inject" data-item="${e(n.edit)}"`) : '<p class="meta">Immutable publication. Fork a draft to edit.</p>') : link(n.kind === 'overview' ? 'Edit brief' : 'Inspect / edit transition', n.edit, 'secondary')}`;
            applyTitleCase(inspector);
            if (event.shiftKey) {
                target.value = n.id;
                status.textContent = 'Node added as the change-request target.';
                request.focus();
            }
            return;
        }
        if (el.dataset.graphZoom) {
            const z = el.dataset.graphZoom;
            if (z === 'layout') {
                for (const n of nodes) {
                    const original = defaults.find(p => p.id === n.id);
                    n.x = original.x;
                    n.y = original.y;
                }
                saveLayout();
                status.textContent = 'Default node layout restored.';
            }
            if (['fit', 'reset', 'layout'].includes(z)) {
                panX = panY = 0;
                viewport.scrollLeft = viewport.scrollTop = 0;
            }
            zoom(z === 'in' ? scale + .1 : z === 'out' ? scale - .1 : z === 'fit' ? (viewport.clientWidth - 32) / Math.max(960, ...nodes.map(n => n.x + 304)) : 1);
            return;
        }
        if (el.hasAttribute('data-graph-save')) {
            if (!draft)
                return;
            if (!target.value || !request.value.trim()) {
                status.textContent = 'Choose a target and enter the requested change.';
                (!target.value ? target : request).focus();
                return;
            }
            try {
                sessionStorage.setItem(key, JSON.stringify({ target: target.value, text: request.value }));
                status.textContent = 'Local request saved. No scenario changes or AI calls were made.';
            }
            catch {
                status.textContent = 'Browser storage is unavailable; copy your request before leaving.';
            }
        }
    });
}
