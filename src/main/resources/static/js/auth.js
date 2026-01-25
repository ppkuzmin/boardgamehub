(() => {
  async function jsonFetch(url, options = {}) {
    const res = await fetch(url, {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Error");
    return data;
  }

  window.Auth = {
    me: () => fetch("/api/auth/me", { credentials: "include" }),
    register: (email, password) => jsonFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
    login: (email, password) => jsonFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
    logout: () => jsonFetch("/api/auth/logout", { method: "POST" })
  };
})();
