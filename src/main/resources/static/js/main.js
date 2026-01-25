document.addEventListener("DOMContentLoaded", () => {
  // ---------- Mobile (burger) menu ----------
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks  = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  // ---------- Auth UI (Login/Register/Logout + hide Tracker) ----------
  setupAuthNav();
  guardTrackerPage();

  function setupAuthNav() {
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks) return;

    const user = (typeof getCurrentUser === "function") ? getCurrentUser() : null;

    // Hide Tracker for guests
    const trackerLink = Array.from(navLinks.querySelectorAll("a"))
      .find(a => a.getAttribute("href") === "tracker.html");
    if (trackerLink) trackerLink.parentElement.style.display = user ? "" : "none";

    // Remove Guestbook / Contact if still present in any file
    ["comments.html", "contacts.html"].forEach(href => {
      const a = Array.from(navLinks.querySelectorAll("a")).find(x => x.getAttribute("href") === href);
      if (a) a.parentElement.remove();
    });

    const existingLogin = Array.from(navLinks.querySelectorAll("a"))
      .find(a => a.getAttribute("href") === "login.html");
    const existingRegister = Array.from(navLinks.querySelectorAll("a"))
      .find(a => a.getAttribute("href") === "register.html");
    const existingLogout = navLinks.querySelector("[data-logout]");

    if (!user) {
      if (existingLogout) existingLogout.closest("li")?.remove();

      if (!existingLogin) {
        const li = document.createElement("li");
        li.innerHTML = `<a href="login.html">Login</a>`;
        navLinks.appendChild(li);
      }
      if (!existingRegister) {
        const li = document.createElement("li");
        li.innerHTML = `<a href="register.html">Register</a>`;
        navLinks.appendChild(li);
      }
    } else {
      if (existingLogin) existingLogin.closest("li")?.remove();
      if (existingRegister) existingRegister.closest("li")?.remove();

      if (!existingLogout) {
        const li = document.createElement("li");
        const email = user.email || "user";
        li.innerHTML = `<a href="#" data-logout title="${email}">Logout</a>`;
        navLinks.appendChild(li);

        li.querySelector("[data-logout]").addEventListener("click", (e) => {
          e.preventDefault();
          if (typeof logoutUser === "function") logoutUser();
          window.location.href = "index.html";
        });
      }
    }
  }

  // If someone tries to open tracker.html directly without auth -> redirect to login
  function guardTrackerPage() {
    const isTracker = window.location.pathname.endsWith("tracker.html");
    if (!isTracker) return;

    const user = (typeof getCurrentUser === "function") ? getCurrentUser() : null;
    if (!user) window.location.href = "login.html";
  }
});
