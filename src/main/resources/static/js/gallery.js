(() => {
  const grid = document.getElementById("gallery-grid");
  const statusEl = document.getElementById("gallery-status");
  if (!grid) return;

  // 1) ТУК си настрой имената -> снимки (основна + hover)
  // Важно: пътищата са спрямо /static (т.е. /images/...)
  const IMAGES = {
    "Dune Imperium": {
      main: "images/dune_imperium_1.webp",
      alt:  "images/dune_imperium_2.webp"
    },
    "Carcassonne": {
      main: "images/carcassonne_1.webp",
      alt:  "images/carcassonne_2.webp"
    },
    "Slay the Spire": {
      main: "images/slay_the_spire_1.webp",
      alt:  "images/slay_the_spire_2.webp"
    },
    "Catan": {
      main: "images/catan_1.webp",
      alt:  "images/catan_2.webp"
    }
  };

  const FALLBACK = {
    main: "images/placeholder.webp",
    alt:  "images/placeholder.webp"
  };

  const escapeHtml = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  async function fetchGames() {
    const res = await fetch("/api/games");
    if (!res.ok) throw new Error("Failed to load games");
    return await res.json();
  }

  function tagGenre(tag) {
    // за да работят твоите цветове: data-genre="deck-building" и т.н.
    return tag.toLowerCase().trim();
  }

  function renderGames(games) {
    grid.innerHTML = "";

    games.forEach((g) => {
      const img = IMAGES[g.name] || FALLBACK;

      const tags = (g.tags || "")
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

      const card = document.createElement("article");
      card.className = "game-card";

      // ✅ ТОВА Е MARKUP-A, който твоят CSS очаква (.game-card-image + .game-image-main/.alt)
      card.innerHTML = `
        <div class="game-card-image">
          <img class="game-image game-image-main" src="${escapeHtml(img.main)}" alt="${escapeHtml(g.name)}">
          <img class="game-image game-image-alt" src="${escapeHtml(img.alt)}" alt="${escapeHtml(g.name)} (alt)">
        </div>

        <div class="game-card-body">
          <h2>${escapeHtml(g.name)}</h2>
          <p>${escapeHtml(g.description || "")}</p>

          <div class="game-tags">
            ${tags.map(t => `
              <button class="game-tag" type="button" data-genre="${escapeHtml(tagGenre(t))}">
                ${escapeHtml(t)}
              </button>
            `).join("")}
          </div>

          <div style="margin-top: 0.9rem;">
            <button class="btn secondary" type="button" data-open-reviews="${g.id}">Reviews</button>
          </div>

          <div class="reviews" id="reviews-${g.id}" style="display:none; margin-top: 0.9rem;">
            <div class="reviews__list" id="reviews-list-${g.id}"></div>

            <div class="reviews__form" id="reviews-form-${g.id}" style="display:none; margin-top: 0.8rem;">
              <div class="form-group">
                <label>Rating (1-5)</label>
                <input type="number" min="1" max="5" value="5" id="rating-${g.id}">
              </div>

              <div class="form-group">
                <label>Text</label>
                <textarea id="text-${g.id}" rows="3"></textarea>
              </div>

              <button class="btn primary" type="button" data-submit-review="${g.id}">Submit</button>
            </div>

            <p class="history-hint" id="reviews-login-hint-${g.id}" style="display:none; margin-top: 0.6rem;">
              Трябва да си логнат, за да добавиш ревю.
            </p>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  async function isLoggedIn() {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      return res.ok;
    } catch { return false; }
  }

  async function loadReviews(gameId) {
    const res = await fetch(`/api/games/${gameId}/reviews`);
    if (!res.ok) throw new Error("Failed to load reviews");
    return await res.json();
  }

  function renderReviews(gameId, reviews) {
    const list = document.getElementById(`reviews-list-${gameId}`);
    if (!list) return;

    if (!reviews.length) {
      list.innerHTML = `<p class="history-hint">Няма ревюта.</p>`;
      return;
    }

    list.innerHTML = reviews.map(r => `
      <div class="comment">
        <strong>${escapeHtml(r.authorEmail)}</strong>
        <div>⭐ ${escapeHtml(r.rating)} / 5</div>
        <div>${escapeHtml(r.text)}</div>
      </div>
    `).join("");
  }

  async function submitReview(gameId) {
    const ratingEl = document.getElementById(`rating-${gameId}`);
    const textEl = document.getElementById(`text-${gameId}`);
    const rating = Number(ratingEl?.value ?? 5);
    const text = (textEl?.value ?? "").trim();

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ gameId: Number(gameId), rating, text })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || "Error");
      return;
    }

    textEl.value = "";
    const reviews = await loadReviews(gameId);
    renderReviews(gameId, reviews);
  }

  async function init() {
    if (statusEl) statusEl.textContent = "Loading...";
    const games = await fetchGames();
    renderGames(games);
    if (statusEl) statusEl.textContent = "";

    grid.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const openId = btn.getAttribute("data-open-reviews");
      if (openId) {
        const panel = document.getElementById(`reviews-${openId}`);
        if (!panel) return;

        const isOpen = panel.style.display !== "none";
        panel.style.display = isOpen ? "none" : "block";
        if (isOpen) return;

        const reviews = await loadReviews(openId);
        renderReviews(openId, reviews);

        const logged = await isLoggedIn();
        document.getElementById(`reviews-form-${openId}`).style.display = logged ? "block" : "none";
        document.getElementById(`reviews-login-hint-${openId}`).style.display = logged ? "none" : "block";
      }

      const submitId = btn.getAttribute("data-submit-review");
      if (submitId) {
        await submitReview(submitId);
      }
    });
  }

  init().catch(err => {
    console.error(err);
    if (statusEl) statusEl.textContent = "Грешка при зареждане.";
    grid.innerHTML = `<p class="history-hint">Грешка при зареждане на игрите.</p>`;
  });
})();
