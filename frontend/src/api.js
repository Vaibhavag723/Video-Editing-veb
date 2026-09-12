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

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

/* ---------- Auth ---------- */
export function signUp(details) {
  return fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  }).then(handleResponse);
}
export function logIn(details) {
  return fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details) }).then(handleResponse);
}
export function forgotPassword(email) {
  return fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
  }).then(handleResponse);
}
export function resetPassword(token, password) {
  return fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
  }).then(handleResponse);
}
export function googleLogin(credential) {
  return fetch(`${BASE_URL}/auth/google`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential }),
  }).then(handleResponse);
}
// Demo-mode Google sign-in (used when VITE_GOOGLE_CLIENT_ID is not configured).
export function googleDevLogin(payload) {
  return fetch(`${BASE_URL}/auth/google/dev`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  }).then(handleResponse);
}
// Ask-a-question form on the public site.
export function askQuestion(payload) {
  return fetch(`${BASE_URL}/contact`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  }).then(handleResponse);
}

/* ---------- Dynamic creative library (data stored in PostgreSQL) ---------- */
export function getTextTemplates() {
  return fetch(`${BASE_URL}/text-templates`).then(handleResponse);
}
export function getStickers() {
  return fetch(`${BASE_URL}/stickers`).then(handleResponse);
}
export function getMusicList() {
  return fetch(`${BASE_URL}/music`).then(handleResponse);
}

/* ---------- Cloud-saved unfinished projects (require sign-in) ---------- */
export function getCloudProjects() {
  return fetch(`${BASE_URL}/projects`, { headers: authHeaders() }).then(handleResponse);
}
export function getCloudProject(id) {
  return fetch(`${BASE_URL}/projects/${id}`, { headers: authHeaders() }).then(handleResponse);
}
export function saveCloudProject(payload) {
  return fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}
export function deleteCloudProject(id) {
  return fetch(`${BASE_URL}/projects/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse);
}

/* ---------- Public website CMS (read-only) ---------- */
export function getSitePages() {
  return fetch(`${BASE_URL}/cms/pages`).then(handleResponse);
}
export function getSitePage(key) {
  return fetch(`${BASE_URL}/cms/pages/${encodeURIComponent(key)}`).then(handleResponse);
}
export function getSitePosts() {
  return fetch(`${BASE_URL}/cms/blog`).then(handleResponse);
}

/* ---------- Admin panel (identified by the caller's session token) ---------- */
export function getAdminStats() {
  return fetch(`${BASE_URL}/admin/stats`, { headers: authHeaders() }).then(handleResponse);
}
export function getAdminUsers() {
  return fetch(`${BASE_URL}/admin/users`, { headers: authHeaders() }).then(handleResponse);
}
export function setAdminRole(targetId, isAdmin) {
  return fetch(`${BASE_URL}/admin/users/${targetId}/role`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ isAdmin }),
  }).then(handleResponse);
}
// Edit a user's profile (name / email / optional new password) — see the
// "Edit" form in the admin users tab.
export function updateAdminUser(targetId, payload) {
  return fetch(`${BASE_URL}/admin/users/${targetId}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload),
  }).then(handleResponse);
}
export function deleteAdminUser(targetId) {
  return fetch(`${BASE_URL}/admin/users/${targetId}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse);
}
export function getAdminLoginEvents() {
  return fetch(`${BASE_URL}/admin/login-events`, { headers: authHeaders() }).then(handleResponse);
}
export function getAdminMessages() {
  return fetch(`${BASE_URL}/admin/messages`, { headers: authHeaders() }).then(handleResponse);
}
export function getAdminPages() {
  return fetch(`${BASE_URL}/admin/pages`, { headers: authHeaders() }).then(handleResponse);
}
export function updateAdminPage(key, payload) {
  return fetch(`${BASE_URL}/admin/pages/${encodeURIComponent(key)}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload),
  }).then(handleResponse);
}
export function getAdminPosts() {
  return fetch(`${BASE_URL}/admin/blog`, { headers: authHeaders() }).then(handleResponse);
}
export function createAdminPost(payload) {
  return fetch(`${BASE_URL}/admin/blog`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) }).then(handleResponse);
}
export function updateAdminPost(id, payload) {
  return fetch(`${BASE_URL}/admin/blog/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload) }).then(handleResponse);
}
export function deleteAdminPost(id) {
  return fetch(`${BASE_URL}/admin/posts/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse);
}
