import { routeTo } from './routes.js';
export function href(c, id, params = {}, query = {}) { return routeTo(id, { ...c.params, orgSlug: c.scope.tenant, ...params }, query); }
export const value = (c, key, fallback = '') => c.query.get(key) || fallback;
