const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}


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

/* ---------- Cloud-saved unfinished projects ---------- */
export function getCloudProjects(userId) {
  return fetch(`${BASE_URL}/projects?userId=${encodeURIComponent(userId)}`).then(handleResponse);
}
export function getCloudProject(id) {
  return fetch(`${BASE_URL}/projects/${id}`).then(handleResponse);
}
export function saveCloudProject(payload) {
  return fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);
}
export function deleteCloudProject(id) {
  return fetch(`${BASE_URL}/projects/${id}`, { method: 'DELETE' }).then(handleResponse);
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

/* ---------- Admin panel (all send the logged-in admin id) ---------- */
const adminHeaders = (userId) => ({ 'Content-Type': 'application/json', 'X-User-Id': String(userId) });

export function getAdminStats(userId) {
  return fetch(`${BASE_URL}/admin/stats`, { headers: adminHeaders(userId) }).then(handleResponse);
}
export function getAdminUsers(userId) {
  return fetch(`${BASE_URL}/admin/users`, { headers: adminHeaders(userId) }).then(handleResponse);
}
export function setAdminRole(userId, targetId, isAdmin) {
  return fetch(`${BASE_URL}/admin/users/${targetId}/role`, {
    method: 'PATCH', headers: adminHeaders(userId), body: JSON.stringify({ isAdmin }),
  }).then(handleResponse);
}
// Edit a user's profile (name / email / optional new password) — see the
// "Edit" form in the admin users tab.
export function updateAdminUser(userId, targetId, payload) {
  return fetch(`${BASE_URL}/admin/users/${targetId}`, {
    method: 'PUT', headers: adminHeaders(userId), body: JSON.stringify(payload),
  }).then(handleResponse);
}
export function deleteAdminUser(userId, targetId) {
  return fetch(`${BASE_URL}/admin/users/${targetId}`, { method: 'DELETE', headers: adminHeaders(userId) }).then(handleResponse);
}
export function getAdminLoginEvents(userId) {
  return fetch(`${BASE_URL}/admin/login-events`, { headers: adminHeaders(userId) }).then(handleResponse);
}
export function getAdminMessages(userId) {
  return fetch(`${BASE_URL}/admin/messages`, { headers: adminHeaders(userId) }).then(handleResponse);
}
export function getAdminPages(userId) {
  return fetch(`${BASE_URL}/admin/pages`, { headers: adminHeaders(userId) }).then(handleResponse);
}
export function updateAdminPage(userId, key, payload) {
  return fetch(`${BASE_URL}/admin/pages/${encodeURIComponent(key)}`, {
    method: 'PUT', headers: adminHeaders(userId), body: JSON.stringify(payload),
  }).then(handleResponse);
}
export function getAdminPosts(userId) {
  return fetch(`${BASE_URL}/admin/blog`, { headers: adminHeaders(userId) }).then(handleResponse);
}
export function createAdminPost(userId, payload) {
  return fetch(`${BASE_URL}/admin/blog`, { method: 'POST', headers: adminHeaders(userId), body: JSON.stringify(payload) }).then(handleResponse);
}
export function updateAdminPost(userId, id, payload) {
  return fetch(`${BASE_URL}/admin/blog/${id}`, { method: 'PUT', headers: adminHeaders(userId), body: JSON.stringify(payload) }).then(handleResponse);
}
export function deleteAdminPost(userId, id) {
  return fetch(`${BASE_URL}/admin/posts/${id}`, { method: 'DELETE', headers: adminHeaders(userId) }).then(handleResponse);
}
