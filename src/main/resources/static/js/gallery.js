// Gallery: loads games from backend (with demo fallback) + public reviews + auth-gated posting
// NOTE: We intentionally avoid declaring `API_BASE` because auth.js already declares it in the global scope.

(() => {
  const GALLERY_API_BASE = "http://localhost:8080/api";

  const DEMO_GAMES = [
    {
      id: 1,
      slug: "dune-imperium",
      name: "Dune Imperium",
      description: "Стратегическа игра, която комбинира deck-building и worker placement в света на „Дюн“.",
      tags: ["deck-building", "worker-placement", "sci-fi"],
      images: ["images/dune_imperium_1.webp", "images/dune_imperium_2.webp"]
    },
    {
      id: 2,
      slug: "carcassonne",
      name: "Carcassonne",
      description: "Класическа tile-laying игра, в която изграждаш градове, пътища и манастири.",
      tags: ["tile-laying", "area-control", "family"],
      images: ["images/Carcassonne_1.webp", "images/Carcassonne_2.webp"]
    },
    {
      id: 3,
      slug: "slay-the-spire",
      name: "Slay the Spire",
      description: "Кооперативна deck-building игра, вдъхновена от дигиталната класика – изкачваш кула и подобряваш тестето.",
      tags: ["deck-building", "co-op", "fantasy"],
      images: ["images/slay_the_spire_1.webp", "images/slay_the_spire_2.webp"]
    },
    {
      id: 4,
      slug: "catan",
      name: "Catan",
      description: "Класика за ресурси и търговия – строиш селища и пътища и стигаш до победни точки.",
      tags: ["resource-management", "trading", "family", "eurogame"],
      images: ["images/catan_1.webp", "images/catan_2.webp"]
    }
  ];

  const LS_REVIEWS_KEY = "bgh_demo_reviews"; // demo only: { [gameId]: [ {rating,text,author,createdAt} ] }

  const qs = (sel, el=document) => el.querySelector(sel);
  const qsa = (sel, el=document) => Array.from(el.querySelectorAll(sel));

  document.addEventListener("DOMContentLoaded", async () => {
    const grid = qs("#gallery-grid");
    const status = qs("#gallery-status");
    if (!grid) return;

    status.textContent = "Зареждане на игри…";

    const games = await loadGames();
    status.textContent = games.mode === "backend"
      ? ""
      : "Demo режим: игрите са локални (бекендът не отговори).";

    renderGames(grid, games.items);
    setupTagFilter();
  });

  async function loadGames() {
    try {
      const res = await fetch(`${GALLERY_API_BASE}/games`);
      if (!res.ok) throw new Error("Failed");
      const items = await res.json();

      const normalized = (Array.isArray(items) ? items : []).map(g => ({
        id: g.id,
        slug: g.slug || slugify(g.name || ""),
        name: g.name,
        description: g.description || "",
        tags: Array.isArray(g.tags) ? g.tags : String(g.tags || "").split(",").map(s=>s.trim()).filter(Boolean),
        images: g.images && Array.isArray(g.images) && g.images.length >= 2
          ? g.images
          : guessImages(g)
      }));

      return { mode: "backend", items: normalized };
    } catch {
      return { mode: "demo", items: DEMO_GAMES };
    }
  }

  function guessImages(g) {
    return ["images/hero_image.png", "images/hero_image.png"];
  }

  function renderGames(grid, games) {
    grid.innerHTML = "";

    games.forEach(game => {
      const card = document.createElement("article");
      card.className = "game-card";
      card.dataset.gameId = String(game.id);
      card.dataset.genres = (game.tags || []).join(", ");

      card.innerHTML = `
        <div class="game-card-image">
          <img src="${escapeHtml(game.images?.[0] || "")}" alt="${escapeHtml(game.name)}" class="game-image game-image-main">
          <img src="${escapeHtml(game.images?.[1] || game.images?.[0] || "")}" alt="${escapeHtml(game.name)} (alternate)" class="game-image game-image-alt">
        </div>

        <div class="game-card-body">
          <h2>${escapeHtml(game.name)}</h2>
          <p>${escapeHtml(game.description)}</p>

          <div class="game-tags">
            ${(game.tags || []).map(t => `<button class="game-tag" data-genre="${escapeHtml(t)}">${prettyTag(t)}</button>`).join("")}
          </div>

          <div class="reviews">
            <button class="btn secondary review-toggle" type="button">Reviews</button>

            <div class="reviews-panel" style="display:none; margin-top: 0.8rem;">
              <p class="reviews-auth-msg" style="display:none; color:#666;">
                Трябва да си логнат, за да оценяваш и коментираш. <a href="login.html">Login</a>
              </p>

              <form class="review-form" style="display:none; box-shadow:none; padding:0; background:transparent;">
                <div class="form-group">
                  <label>Рейтинг (1–5)</label>
                  <select class="review-rating" required>
                    <option value="">Избери</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Коментар</label>
                  <textarea class="review-text" rows="3" required></textarea>
                </div>

                <button class="btn primary" type="submit">Добави</button>
                <p class="form-result review-result"></p>
              </form>

              <div class="reviews-list" style="margin-top: 0.8rem;"></div>
            </div>
          </div>
        </div>
      `;

      grid.appendChild(card);
      wireReviews(card, game.id);
    });
  }

  function wireReviews(card, gameId) {
    const toggleBtn = qs(".review-toggle", card);
    const panel = qs(".reviews-panel", card);
    const authMsg = qs(".reviews-auth-msg", card);
    const form = qs(".review-form", card);
    const list = qs(".reviews-list", card);
    const result = qs(".review-result", card);

    toggleBtn.addEventListener("click", async () => {
      const isOpen = panel.style.display !== "none";
      panel.style.display = isOpen ? "none" : "block";

      if (!isOpen) {
        const user = (typeof getCurrentUser === "function") ? getCurrentUser() : null;
        authMsg.style.display = user ? "none" : "block";
        form.style.display = user ? "block" : "none";

        list.innerHTML = "<p style='color:#666'>Зареждане…</p>";
        const reviews = await loadReviews(gameId);
        renderReviews(list, reviews);
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      result.textContent = "";

      const user = (typeof getCurrentUser === "function") ? getCurrentUser() : null;
      if (!user) {
        result.style.color = "#d32f2f";
        result.textContent = "Трябва да си логнат.";
        return;
      }

      const rating = parseInt(qs(".review-rating", form).value, 10);
      const text = qs(".review-text", form).value.trim();

      if (!rating || rating < 1 || rating > 5 || !text) {
        result.style.color = "#d32f2f";
        result.textContent = "Моля, избери рейтинг и напиши коментар.";
        return;
      }

      try {
        await postReview({ gameId, rating, text });
        result.style.color = "#2e7d32";
        result.textContent = "Добавено!";
        form.reset();

        const reviews = await loadReviews(gameId);
        renderReviews(list, reviews);
      } catch (err) {
        result.style.color = "#d32f2f";
        result.textContent = err.message || "Грешка при добавяне.";
      }
    });
  }

  async function loadReviews(gameId) {
    try {
      const res = await fetch(`${GALLERY_API_BASE}/games/${encodeURIComponent(gameId)}/reviews`);
      if (!res.ok) throw new Error("No backend reviews");
      const items = await res.json();
      return (Array.isArray(items) ? items : []).map(r => ({
        rating: r.rating,
        text: r.text || r.comment || "",
        author: r.authorEmail || r.author || r.userEmail || "anonymous",
        createdAt: r.createdAt || r.date || ""
      }));
    } catch {
      const all = loadDemoReviews();
      return all[String(gameId)] || [];
    }
  }

  async function postReview({ gameId, rating, text }) {
    const user = (typeof getCurrentUser === "function") ? getCurrentUser() : null;
    if (!user) throw new Error("Not authenticated");

    try {
      const res = await fetch(`${GALLERY_API_BASE}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, rating, text })
      });
      if (!res.ok) {
        let msg = "Failed to save review";
        try {
          const j = await res.json();
          msg = j.message || j.error || msg;
        } catch {}
        throw new Error(msg);
      }
      return;
    } catch {
      const all = loadDemoReviews();
      const key = String(gameId);
      all[key] = all[key] || [];
      all[key].unshift({
        rating,
        text,
        author: user.email || "demo",
        createdAt: new Date().toISOString().slice(0, 10)
      });
      saveDemoReviews(all);
    }
  }

  function renderReviews(container, reviews) {
    container.innerHTML = "";

    if (!reviews || !reviews.length) {
      container.innerHTML = "<p style='color:#666'>Няма ревюта още.</p>";
      return;
    }

    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "0.6rem";

    reviews.forEach(r => {
      const item = document.createElement("div");
      item.className = "comment";
      const ratingNum = Math.max(0, Math.min(5, Number(r.rating || 0)));
      const stars = "★".repeat(ratingNum) + "☆".repeat(5 - ratingNum);

      item.innerHTML = `
        <strong>${escapeHtml(r.author || "anonymous")}</strong>
        <div style="margin:0.2rem 0; color:#b26a1b; font-weight:800;">${stars} <span style="color:#666; font-weight:600;">(${escapeHtml(String(ratingNum))}/5)</span></div>
        <div style="color:#444;">${escapeHtml(r.text || "")}</div>
        ${r.createdAt ? `<div style="margin-top:0.35rem; font-size:0.85rem; color:#777;">${escapeHtml(r.createdAt)}</div>` : ""}
      `;
      wrap.appendChild(item);
    });

    container.appendChild(wrap);
  }

  function setupTagFilter() {
    const active = new Set();

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".game-tag");
      if (!btn) return;

      const tag = btn.dataset.genre;
      if (!tag) return;

      if (active.has(tag)) {
        active.delete(tag);
        btn.classList.remove("active");
      } else {
        active.add(tag);
        btn.classList.add("active");
      }

      applyFilter(active);
    });
  }

  function applyFilter(activeSet) {
    const cards = qsa(".game-card");
    if (!activeSet.size) {
      cards.forEach(c => c.classList.remove("game-card-hidden"));
      return;
    }

    cards.forEach(card => {
      const genres = String(card.dataset.genres || "").toLowerCase();
      const ok = Array.from(activeSet).every(t => genres.includes(String(t).toLowerCase()));
      card.classList.toggle("game-card-hidden", !ok);
    });
  }

  function loadDemoReviews() {
    try {
      const raw = localStorage.getItem(LS_REVIEWS_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return (data && typeof data === "object") ? data : {};
    } catch { return {}; }
  }
  function saveDemoReviews(obj) {
    localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(obj));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function prettyTag(tag) {
    const map = {
      "deck-building": "Deck-building",
      "worker-placement": "Worker Placement",
      "sci-fi": "Sci-Fi",
      "tile-laying": "Tile-laying",
      "area-control": "Area Control",
      "family": "Family Game",
      "co-op": "Co-op",
      "fantasy": "Fantasy",
      "resource-management": "Resource Management",
      "trading": "Trading",
      "eurogame": "Eurogame"
    };
    return map[tag] || tag;
  }

  function slugify(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
})();