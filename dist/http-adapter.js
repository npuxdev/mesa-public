import { ContractError } from './contracts.js';
export class HttpAdapter {
    mode = 'live';
    csrf = '';
    boot = null;
    aiConfigured = false;
    model = '';
    async connect() {
        if (!this.boot)
            this.boot = (async () => { const response = await fetch('/api/bootstrap', { credentials: 'same-origin' }); if (!response.ok)
                throw new ContractError('SERVICE_UNAVAILABLE', 'The local backend is unavailable.'); const config = await response.json(); this.csrf = config.csrf; this.aiConfigured = config.ai; this.model = config.model; if (!config.database)
                throw new ContractError('DATABASE_UNAVAILABLE', 'Local Supabase is unavailable. Start it with npm run db:start, then reload.'); })();
        try {
            await this.boot;
        }
        catch (error) {
            this.boot = null;
            throw error;
        }
    }
    async request(path, scope, payload = {}) {
        await this.connect();
        let response;
        try {
            response = await fetch(path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Strata-Csrf': this.csrf }, body: JSON.stringify({ scope, ...payload }), signal: AbortSignal.timeout(60000) });
        }
        catch {
            throw new ContractError('CONNECTION', 'Connection interrupted. Check the original receipt/proposal before retrying.');
        }
        const result = await response.json();
        if (!response.ok)
            throw new ContractError(result.code || 'SERVICE_ERROR', result.message || 'Local request failed.');
        return result;
    }
    async read(scope) {
        try {
            let initial;
            try {
                const raw = sessionStorage.getItem(`strata-workflow-v2:${scope.tenant}`);
                if (raw) {
                    const ledger = JSON.parse(sessionStorage.getItem('strata-command-ledger-v2') || '{}');
                    initial = { data: JSON.parse(raw), receipts: ledger.receipts || [], pending: ledger.pending || [] };
                }
            }
            catch { }
            return await this.request('/api/read', scope, { initial });
        }
        catch (error) {
            return { status: 'error', code: error instanceof ContractError ? error.code : 'CONNECTION', message: error instanceof Error ? error.message : 'Local backend unavailable.', retryable: true };
        }
    }
    command(scope, command) { return this.request('/api/command', scope, { command }); }
    commandStatus(scope, id) { return this.request('/api/command-status', scope, { id }); }
    clearScope() { } // Durable server receipts survive navigation and identity changes.
    propose(scope, scenarioId, target, request, id) { return this.request('/api/ai/propose', scope, { scenarioId, target, request, id }); }
    proposals(scope, scenarioId) { return this.request('/api/ai/list', scope, { scenarioId }); }
    decide(scope, id, accept) { return this.request('/api/ai/decide', scope, { id, accept }); }
}
