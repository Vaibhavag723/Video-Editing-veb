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

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    // A 401 on an authenticated request means the session is gone (expired
    // token, deleted account, server restart). Clear it and let the app
    // redirect, rather than leaving the UI in a half-logged-in state.
    if (res.status === 401 && sessionToken) {
      clearSessionToken();
      if (onSessionExpired) onSessionExpired();
      throw new Error(body.error || 'Your session has expired. Please sign in again.');
    }

    // Map the status codes users actually hit to plain language. The server's
    // own message wins when it has one, since it is more specific.
    const fallback = {
      400: 'Something in that request was not quite right. Please check the form and try again.',
      403: 'You do not have permission to do that.',
      404: 'We could not find what you were looking for.',
      409: 'That conflicts with something that already exists.',
      429: 'Too many attempts. Please wait a few minutes and try again.',
      500: 'Something went wrong on our end. Please try again in a moment.',
    }[res.status];

    throw new Error(body.error || fallback || `Request failed (status ${res.status}).`);
  }
  // 204 / empty bodies would otherwise throw on .json()
  return res.status === 204 ? null : res.json().catch(() => ({}));
}

/* Wraps fetch so a dead/unreachable backend produces a message a person can
 * act on, instead of the browser's raw "Failed to fetch" / "NetworkError". */
async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error('Cannot reach the server. Check your connection and make sure the backend is running.');
  }
  return handleResponse(res);
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
export function getSitePage(key) {
  return request(`${BASE_URL}/cms/pages/${encodeURIComponent(key)}`);
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
