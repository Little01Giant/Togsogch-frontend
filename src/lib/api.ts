export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: any) { super(message); }
}

const BASE = '/api/v1';
type Opts = { method?: string; body?: any; query?: Record<string, any>; noRefresh?: boolean };

function qs(query?: Record<string, any>) {
  if (!query) return '';
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) continue;
    p.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

let refreshing: Promise<boolean> | null = null;
async function tryRefresh() {
  refreshing ??= fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include', headers: { 'x-requested-with': 'fetch' } })
    .then((r) => r.ok).catch(() => false).finally(() => { setTimeout(() => (refreshing = null), 0); });
  return refreshing;
}

export async function api<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const doFetch = () => fetch(`${BASE}${path}${qs(opts.query)}`, {
    method: opts.method ?? 'GET', credentials: 'include',
    headers: { 'x-requested-with': 'fetch', ...(opts.body !== undefined ? { 'content-type': 'application/json' } : {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  let res: Response;
  try { res = await doFetch(); } catch { throw new ApiError(0, 'NETWORK', 'Сүлжээний алдаа. Холболтоо шалгана уу.'); }
  if (res.status === 401 && !opts.noRefresh && !['/auth/refresh', '/auth/logout', '/auth/dev-login', '/auth/config'].includes(path)) {
    if (await tryRefresh()) res = await doFetch();
  }
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* JSON биш (жишээ: proxy-ийн HTML алдаа) */ }
  if (!res.ok) throw new ApiError(res.status, data?.code ?? 'ERROR', data?.message ?? 'Алдаа гарлаа. Дахин оролдоно уу.', data?.details);
  if (text && data === null) throw new ApiError(res.status, 'BAD_RESPONSE', 'Серверээс буруу хариу ирлээ.');
  return data as T;
}
