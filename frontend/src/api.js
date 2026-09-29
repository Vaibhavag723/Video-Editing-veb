const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ---------- Session token ----------
 * Held in memory for the life of the tab (matches the app's existing
 * behavior of not persisting login across a hard refresh). Every
 * authenticated request attaches it as `Authorization: Bearer <token>`
 * instead of sending a client-chosen user id, which the old code trusted
 * at face value.
 */
let sessionToken = null;
export function setSessionToken(token) { sessionToken = token || null; }
export function clearSessionToken() { sessionToken = null; }

function authHeaders(extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
  return headers;
}

/* Optional hook so the app can react to an expired/invalid session (e.g. send
 * the user back to the login screen) instead of every caller handling it. */
let onSessionExpired = null;
export function setOnSessionExpired(fn) { onSessionExpired = fn; }

async function parseBody(res) {
  // 204 / empty bodies would otherwise throw on .json()
  return res.status === 204 ? null : res.json().catch(() => ({}));
}

function friendlyError(status, body) {
  // Map the status codes users actually hit to plain language. The server's
  // own message wins when it has one, since it is more specific.
  const fallback = {
    400: 'Something in that request was not quite right. Please check the form and try again.',
    403: 'You do not have permission to do that.',
    404: 'We could not find what you were looking for.',
    409: 'That conflicts with something that already exists.',
    429: 'Too many attempts. Please wait a few minutes and try again.',
    500: 'Something went wrong on our end. Please try again in a moment.',
  }[status];
  return new Error(body.error || fallback || `Request failed (status ${status}).`);
}

// The refresh cookie is sent automatically by the browser, so the server also
// demands this custom header on the cookie endpoints (/auth/refresh, /logout,
// /logout-all). A forged cross-site request can't add it without a CORS
// preflight, which the server only approves for ALLOWED_ORIGINS.
const COOKIE_ENDPOINT_HEADERS = { 'X-Requested-With': 'XMLHttpRequest' };

// True while a refresh is already in flight, so several requests that all
// hit a 401 at once (e.g. a batch of parallel calls right as the access
// token expires) share one refresh instead of racing to rotate the same
// refresh-token cookie multiple times.
let refreshInFlight = null;

// Exchanges the httpOnly refresh-token cookie for a new 15-minute access
// token. Never goes through request()/handleResponse() itself — a 401 here
// means the refresh token is gone too, which is the actual "please sign in
// again" case, not something to retry.
async function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include', headers: COOKIE_ENDPOINT_HEADERS })
      .then(async (res) => {
        if (!res.ok) return null;
        const body = await parseBody(res);
        return body?.token || null;
      })
      .catch(() => null)
      .finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

async function handleResponse(res, retryingUrl, retryingOptions) {
  if (!res.ok) {
    const body = await parseBody(res);

    // An expired 15-minute access token is the common case, not a real
    // "logged out" event — try the refresh-token cookie once before giving
    // up. Only worth attempting for calls that actually sent a session
    // token in the first place (public, unauthenticated calls get a plain
    // 401 handled below instead).
    const hadAuthHeader = !!retryingOptions?.headers?.Authorization;
    if (res.status === 401 && hadAuthHeader && sessionToken) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        setSessionToken(newToken);
        const retryRes = await fetch(retryingUrl, {
          ...retryingOptions,
          credentials: 'include',
          headers: { ...retryingOptions.headers, Authorization: `Bearer ${newToken}` },
        });
        if (retryRes.ok) return parseBody(retryRes);
        // Fall through below with the retry's response — if it's still a
        // 401 the refresh token itself must be invalid, so don't loop again.
        const retryBody = await parseBody(retryRes);
        if (retryRes.status === 401) {
          clearSessionToken();
          if (onSessionExpired) onSessionExpired();
          throw new Error(retryBody.error || 'Your session has expired. Please sign in again.');
        }
        throw friendlyError(retryRes.status, retryBody);
      }
      // No valid refresh token either — the session really is over.
      clearSessionToken();
      if (onSessionExpired) onSessionExpired();
      throw new Error(body.error || 'Your session has expired. Please sign in again.');
    }

    throw friendlyError(res.status, body);
  }
  return parseBody(res);
}

/* Wraps fetch so a dead/unreachable backend produces a message a person can
 * act on, instead of the browser's raw "Failed to fetch" / "NetworkError".
 * `credentials: 'include'` is on every call (not just auth ones) because the
 * refresh-token cookie is scoped to /api/auth by the server, so the browser
 * simply won't attach it to other paths — no need to special-case which
 * calls "need" it here, and it keeps this one code path the only place that
 * decides cookie behavior. */
async function request(url, options) {
  let res;
  const fullOptions = { ...options, credentials: 'include' };
  try {
    res = await fetch(url, fullOptions);
  } catch {
    throw new Error('Cannot reach the server. Check your connection and make sure the backend is running.');
  }
  return handleResponse(res, url, fullOptions);
}

// Called once on app load to silently resume a session from the refresh-
// token cookie, if a valid one exists — without this, a page refresh would
// otherwise sign the user out despite the cookie still being good for up to
// 30 days. Deliberately bypasses request()/refreshInFlight: at this point
// there is no access token yet, so a 401 here just means "not signed in",
// not "session expired", and shouldn't trigger onSessionExpired.
export async function restoreSession() {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include', headers: COOKIE_ENDPOINT_HEADERS });
    if (!res.ok) return null;
    const body = await parseBody(res);
    if (!body?.token) return null;
    setSessionToken(body.token);
    return body;
  } catch {
    return null;
  }
}

/* ---------- Auth ---------- */
export function signUp(details) {
  return request(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
}
export function logIn(details) {
  return request(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details) });
}
// Revokes the refresh-token cookie server-side so this session can't be
// silently renewed after the user has chosen to sign out — without this,
// clearing the in-memory access token alone would still leave a valid
// 30-day refresh token sitting in the browser's cookie jar.
export function logOut() {
  return fetch(`${BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include', headers: COOKIE_ENDPOINT_HEADERS }).catch(() => {});
}
// "Sign out everywhere": revokes the refresh tokens of every browser/device on
// this account. Requires a live access token, so it goes through request().
export function logOutEverywhere() {
  return request(`${BASE_URL}/auth/logout-all`, { method: 'POST', headers: authHeaders(COOKIE_ENDPOINT_HEADERS) });
}
export function forgotPassword(email) {
  return request(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
  });
}
export function resetPassword(token, password) {
  return request(`${BASE_URL}/auth/reset-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
  });
}
export function googleLogin(credential) {
  return request(`${BASE_URL}/auth/google`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential }),
  });
}
// Demo-mode Google sign-in (used when VITE_GOOGLE_CLIENT_ID is not configured).
export function googleDevLogin(payload) {
  return request(`${BASE_URL}/auth/google/dev`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
}
// Ask-a-question form on the public site.
export function askQuestion(payload) {
  return request(`${BASE_URL}/contact`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
}

/* ---------- Dynamic creative library (data stored in PostgreSQL) ---------- */
export function getTextTemplates() {
  return request(`${BASE_URL}/text-templates`);
}
export function getStickers() {
  return request(`${BASE_URL}/stickers`);
}
export function getMusicList() {
  return request(`${BASE_URL}/music`);
}

/* ---------- Cloud-saved unfinished projects (require sign-in) ---------- */
export function getCloudProjects() {
  return request(`${BASE_URL}/projects`, { headers: authHeaders() });
}
export function getCloudProject(id) {
  return request(`${BASE_URL}/projects/${id}`, { headers: authHeaders() });
}
export function saveCloudProject(payload) {
  return request(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}
export function deleteCloudProject(id) {
  return request(`${BASE_URL}/projects/${id}`, { method: 'DELETE', headers: authHeaders() });
}

/* ---------- Public website CMS (read-only) ---------- */
export function getSitePages() {
  return request(`${BASE_URL}/cms/pages`);
}
export function getSitePosts() {
  return request(`${BASE_URL}/cms/blog`);
}

/* ---------- Admin panel (identified by the caller's session token) ---------- */
export function getAdminStats() {
  return request(`${BASE_URL}/admin/stats`, { headers: authHeaders() });
}
export function getAdminUsers() {
  return request(`${BASE_URL}/admin/users`, { headers: authHeaders() });
}
export function setAdminRole(targetId, isAdmin) {
  return request(`${BASE_URL}/admin/users/${targetId}/role`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ isAdmin }),
  });
}
// Edit a user's profile (name / email / optional new password) — see the
// "Edit" form in the admin users tab.
export function updateAdminUser(targetId, payload) {
  return request(`${BASE_URL}/admin/users/${targetId}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload),
  });
}
export function deleteAdminUser(targetId) {
  return request(`${BASE_URL}/admin/users/${targetId}`, { method: 'DELETE', headers: authHeaders() });
}
export function getAdminLoginEvents() {
  return request(`${BASE_URL}/admin/login-events`, { headers: authHeaders() });
}
export function getAdminMessages() {
  return request(`${BASE_URL}/admin/messages`, { headers: authHeaders() });
}
export function getAdminPages() {
  return request(`${BASE_URL}/admin/pages`, { headers: authHeaders() });
}
export function updateAdminPage(key, payload) {
  return request(`${BASE_URL}/admin/pages/${encodeURIComponent(key)}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload),
  });
}
export function getAdminPosts() {
  return request(`${BASE_URL}/admin/blog`, { headers: authHeaders() });
}
export function createAdminPost(payload) {
  return request(`${BASE_URL}/admin/blog`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
}
export function updateAdminPost(id, payload) {
  return request(`${BASE_URL}/admin/blog/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload) });
}
export function deleteAdminPost(id) {
  return request(`${BASE_URL}/admin/posts/${id}`, { method: 'DELETE', headers: authHeaders() });
}
