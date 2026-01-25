document.addEventListener("DOMContentLoaded", async () => {
  // ----- Burger menu -----
  const toggleBtn = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  // ----- Auth nav toggle + guard -----
  const isTrackerPage = location.pathname.endsWith("/tracker.html");

  const navTracker = document.querySelector('[data-nav="tracker"]');
  const navLogin = document.querySelector('[data-nav="login"]');
  const navRegister = document.querySelector('[data-nav="register"]');
  const navLogout = document.querySelector('[data-nav="logout"]');

  let logged = false;
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    logged = res.ok;
  } catch {
    logged = false;
  }

  if (navTracker) navTracker.style.display = logged ? "inline-block" : "none";
  if (navLogin) navLogin.style.display = logged ? "none" : "inline-block";
  if (navRegister) navRegister.style.display = logged ? "none" : "inline-block";
  if (navLogout) navLogout.style.display = logged ? "inline-block" : "none";

  if (isTrackerPage && !logged) {
    location.href = "/login.html";
    return;
  }

  if (navLogout) {
    navLogout.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await window.Auth.logout();
      } catch {}
      location.href = "/index.html";
    });
  }
});
