export const disciplines = ['Incident response', 'Disaster recovery', 'Business continuity', 'Crisis management'];
export class ContractError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
export function assertMutation(value) {
    if (!value || typeof value !== 'object')
        throw new ContractError('INVALID_COMMAND', 'A command object is required.');
    const v = value;
    if (typeof v.type !== 'string' || typeof v.resourceId !== 'string' || typeof v.idempotencyKey !== 'string' || !v.idempotencyKey || !v.payload || typeof v.payload !== 'object' || Array.isArray(v.payload))
        throw new ContractError('INVALID_COMMAND', 'The command does not match the fixture contract.');
}
export function assertMetric(value) {
    if (value.displayState !== 'supported' && value.value !== null)
        throw new ContractError('INVALID_METRIC', 'Unsupported metrics must not carry a numeric value.');
    if (value.denominator !== undefined && value.denominator < 1)
        throw new ContractError('INVALID_METRIC', 'A positive denominator is required.');
    return value;
}
export function assertFixtureData(value) {
    if (!value || typeof value !== 'object')
        throw new ContractError('INVALID_RESPONSE', 'Read model unavailable.');
    for (const key of ['scenarios', 'sessions', 'findings', 'reports', 'actions', 'evidence', 'facts', 'people', 'audit', 'goals', 'messages', 'decisions']) {
        if (!Array.isArray(value[key]))
            throw new ContractError('INVALID_RESPONSE', `Invalid ${key} response.`);
    }
}
