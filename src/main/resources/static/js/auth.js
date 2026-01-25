// BoardGameHub - ultra simple auth helper
// Works in two modes:
// 1) Backend mode (if endpoints respond): POST http://localhost:8080/api/auth/login|register
// 2) Demo mode fallback (localStorage) if backend is not running yet.

const API_BASE = "http://localhost:8080/api";
const STORAGE_USER_KEY = "bgh_current_user";

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
}

function logoutUser() {
  localStorage.removeItem(STORAGE_USER_KEY);
}

async function postJson(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const j = await res.json();
      msg = j.message || j.error || msg;
    } catch {}
    throw new Error(msg);
  }
  const text = await res.text();
  try { return text ? JSON.parse(text) : {}; } catch { return {}; }
}

async function loginUser(email, password) {
  try {
    const payload = { email, password };
    const data = await postJson(`${API_BASE}/auth/login`, payload);
    const user = { email: data.email || email, id: data.id };
    setCurrentUser(user);
    return { ok: true, user, mode: "backend" };
  } catch (e) {
    const demoUser = { email, id: "demo" };
    setCurrentUser(demoUser);
    return { ok: true, user: demoUser, mode: "demo", warning: String(e.message || e) };
  }
}

async function registerUser(email, password) {
  try {
    const payload = { email, password };
    const data = await postJson(`${API_BASE}/auth/register`, payload);
    const user = { email: data.email || email, id: data.id };
    setCurrentUser(user);
    return { ok: true, user, mode: "backend" };
  } catch (e) {
    const demoUser = { email, id: "demo" };
    setCurrentUser(demoUser);
    return { ok: true, user: demoUser, mode: "demo", warning: String(e.message || e) };
  }
}
