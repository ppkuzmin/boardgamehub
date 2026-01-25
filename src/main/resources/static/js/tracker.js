document.addEventListener("DOMContentLoaded", () => {
  // ----- TABS -----
  const tabButtons = document.querySelectorAll(".tracker-tab");
  const tabPanels  = document.querySelectorAll(".tracker-panel");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const panel = document.getElementById(`tab-${target}`);
      if (panel) panel.classList.add("active");
    });
  });

  // ----- FORM ELEMENTS -----
  const gameForm         = document.getElementById("game-form");
  const gameDateInput    = document.getElementById("game-date");
  const gameSelect       = document.getElementById("game-select");
  const numPlayersInput  = document.getElementById("num-players");
  const playersContainer = document.getElementById("players-container");

  // ----- HISTORY ELEMENTS -----
  const historyList     = document.getElementById("history-list");
  const clearHistoryBtn = document.getElementById("clear-history-btn");

  // ----- STATS ELEMENTS -----
  const gameFilterSelect = document.getElementById("game-filter");
  const statsCanvas      = document.getElementById("stats-chart");
  const noStatsMessage   = document.getElementById("no-stats-message");

  let sessions = [];
  let gamesCache = [];
  let chartInstance = null;

  if (!gameForm || !gameSelect || !playersContainer) {
    console.warn("Tracker: missing main elements in HTML.");
    return;
  }

  // date default
  const today = new Date().toISOString().split("T")[0];
  if (gameDateInput) gameDateInput.value = today;

  const initialCount = numPlayersInput ? (parseInt(numPlayersInput.value, 10) || 2) : 2;
  buildPlayerRows(initialCount);

  // players count change
  if (numPlayersInput) {
    numPlayersInput.addEventListener("change", () => {
      let count = parseInt(numPlayersInput.value, 10);
      if (isNaN(count) || count < 1) count = 1;
      if (count > 10) count = 10;
      numPlayersInput.value = count;
      buildPlayerRows(count);
    });
  }

  // init
  init().catch(err => {
    console.error(err);
    alert(err.message || "Грешка при зареждане на Tracker.");
  });

  async function init() {
    // 1) games
    gamesCache = await apiGetGames();
    fillGamesSelect(gamesCache);

    // 2) sessions for current user
    sessions = await apiGetSessions();

    renderHistory();
    populateGameFilter();
    updateChart();
  }

  function buildPlayerRows(count) {
    playersContainer.innerHTML = "";
    const medalEmojis = ["🥇", "🥈", "🥉"];

    for (let i = 0; i < count; i++) {
      const place = i + 1;

      const row = document.createElement("div");
      row.className = "player-row";

      const labelSpan = document.createElement("span");
      labelSpan.className = "player-rank";
      labelSpan.textContent = medalEmojis[i] || `${place}.`;

      const input = document.createElement("input");
      input.type = "text";
      input.className = "player-name-input";
      input.placeholder = `Име на играч ${place}`;

      row.appendChild(labelSpan);
      row.appendChild(input);
      playersContainer.appendChild(row);
    }
  }

  function fillGamesSelect(games) {
    gameSelect.innerHTML = "";
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "Избери игра";
    opt0.selected = true;
    gameSelect.appendChild(opt0);

    games.forEach(g => {
      const opt = document.createElement("option");
      opt.value = String(g.id);
      opt.textContent = g.name;
      gameSelect.appendChild(opt);
    });
  }

  function findGameNameById(id) {
    const g = gamesCache.find(x => String(x.id) === String(id));
    return g ? g.name : "";
  }

  // ----- SUBMIT -> backend POST -----
  gameForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const gameId = gameSelect.value;
    const gameDate = (gameDateInput && gameDateInput.value) ? gameDateInput.value : today;

    if (!gameId) {
      alert("Моля, избери игра.");
      return;
    }

    const playerInputs = Array.from(playersContainer.querySelectorAll(".player-name-input"));
    const players = [];
    playerInputs.forEach((input, index) => {
      const name = input.value.trim();
      if (name) players.push({ name, place: index + 1 });
    });

    if (!players.length) {
      alert("Моля, въведи поне един участник.");
      return;
    }

    // backend payload
    const payload = {
      gameId: Number(gameId),
      playedAt: gameDate,
      players
    };

    try {
      await apiCreateSession(payload);

      // reload sessions from backend (source of truth)
      sessions = await apiGetSessions();

      // reset UI
      gameForm.reset();
      if (gameDateInput) gameDateInput.value = today;
      if (numPlayersInput) numPlayersInput.value = 2;
      buildPlayerRows(2);
      gameSelect.value = String(payload.gameId);

      renderHistory();
      populateGameFilter();
      updateChart();

      alert("Играта е записана!");
    } catch (err) {
      if (String(err.message || "").toLowerCase().includes("not authenticated")) {
        location.href = "/login.html";
        return;
      }
      alert(err.message || "Грешка при запис.");
    }
  });

  // ----- HISTORY -----
  function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";

    if (!sessions.length) {
      const empty = document.createElement("p");
      empty.className = "history-hint";
      empty.textContent = "Все още няма записани игри.";
      historyList.appendChild(empty);
      return;
    }

    const medalEmojis = ["🥇", "🥈", "🥉"];

    // sessions already sorted by backend (desc), but safe:
    const sorted = [...sessions].sort((a, b) => Number(b.id) - Number(a.id));

    sorted.forEach(s => {
      const card = document.createElement("div");
      card.className = "history-item";

      const header = document.createElement("div");
      header.className = "history-item-header";

      const gameLabel = s.gameName || findGameNameById(s.gameId) || `Game #${s.gameId}`;

      header.innerHTML = `
        <strong>${escapeHtml(gameLabel)}</strong>
        <span class="history-date">${escapeHtml(s.playedAt)}</span>
      `;
      card.appendChild(header);

      const playersWrapper = document.createElement("div");
      playersWrapper.className = "history-players";

      (s.players || []).forEach(p => {
        const line = document.createElement("div");
        line.className = "history-player-line";

        const place = Number(p.place);

        const rankSpan = document.createElement("span");
        rankSpan.className = "history-player-rank";
        rankSpan.textContent = medalEmojis[place - 1] || `${place}.`;

        const nameSpan = document.createElement("span");
        nameSpan.className = "history-player-name";
        nameSpan.textContent = p.name;

        const placeSpan = document.createElement("span");
        placeSpan.className = "history-player-place";
        placeSpan.textContent = `Място: ${place}`;

        if (place === 1) line.classList.add("winner");
        else if (place === 2) line.classList.add("second");
        else if (place === 3) line.classList.add("third");

        line.appendChild(rankSpan);
        line.appendChild(nameSpan);
        line.appendChild(placeSpan);
        playersWrapper.appendChild(line);
      });

      card.appendChild(playersWrapper);
      historyList.appendChild(card);
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      alert("Още нямаме DELETE endpoint в бекенда. Ако искаш, ще го добавим следващата стъпка.");
    });
  }

  // ----- STATS -----
  if (gameFilterSelect) {
    gameFilterSelect.addEventListener("change", updateChart);
  }

  function populateGameFilter() {
    if (!gameFilterSelect) return;

    const games = Array.from(new Set(
      sessions.map(s => s.gameName || findGameNameById(s.gameId) || `Game #${s.gameId}`)
    )).sort();

    gameFilterSelect.innerHTML = "";

    if (!games.length) {
      const opt = document.createElement("option");
      opt.value = "all";
      opt.textContent = "Няма записани игри";
      opt.disabled = true;
      opt.selected = true;
      gameFilterSelect.appendChild(opt);
      return;
    }

    const allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = "Всички игри";
    gameFilterSelect.appendChild(allOpt);

    games.forEach(gameName => {
      const opt = document.createElement("option");
      opt.value = gameName;
      opt.textContent = gameName;
      gameFilterSelect.appendChild(opt);
    });
  }

  function buildWinsByPlayer(gameFilter) {
    const wins = new Map();

    sessions.forEach(s => {
      const gameLabel = s.gameName || findGameNameById(s.gameId) || `Game #${s.gameId}`;
      if (gameFilter !== "all" && gameLabel !== gameFilter) return;

      (s.players || []).forEach(p => {
        if (Number(p.place) === 1) {
          wins.set(p.name, (wins.get(p.name) || 0) + 1);
        }
      });
    });

    return Array.from(wins.entries()).sort((a, b) => b[1] - a[1]);
  }

  function updateChart() {
    if (!statsCanvas) return;

    const gameFilter = gameFilterSelect ? gameFilterSelect.value : "all";
    const winsArray = buildWinsByPlayer(gameFilter);
    const podiumEl = document.getElementById("stats-podium");

    if (!winsArray.length) {
      statsCanvas.style.display = "none";
      if (noStatsMessage) noStatsMessage.style.display = "block";
      if (podiumEl) podiumEl.innerHTML = "";
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      return;
    }

    statsCanvas.style.display = "block";
    if (noStatsMessage) noStatsMessage.style.display = "none";

    const labels = winsArray.map(([name]) => name);
    const data   = winsArray.map(([, w]) => w);

    if (chartInstance) chartInstance.destroy();

    const ctx = statsCanvas.getContext("2d");
    chartInstance = new Chart(ctx, {
      type: "bar",
      data: { labels, datasets: [{ data }] },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: gameFilter === "all"
              ? "Общ брой победи (всички игри)"
              : `Победи в играта ${gameFilter}`
          }
        },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
        }
      }
    });

    if (podiumEl) {
      const medals = ["🥇", "🥈", "🥉"];
      podiumEl.innerHTML = winsArray.slice(0, 3).map(([name, w], i) => `
        <div class="podium-row">
          <span class="podium-medal">${medals[i] || ""}</span>
          <span class="podium-name">${escapeHtml(name)}</span>
          <span class="podium-wins">${w} победи</span>
        </div>
      `).join("");
    }
  }

  // ----- API -----
  async function apiGetGames() {
    const res = await fetch("/api/games", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load games");
    const items = await res.json();
    return (Array.isArray(items) ? items : [])
      .map(g => ({ id: g.id, name: g.name }))
      .filter(g => g.id != null && g.name);
  }

  async function apiGetSessions() {
    const res = await fetch("/api/tracker/sessions", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Not authenticated");
    return Array.isArray(data) ? data : [];
  }

  async function apiCreateSession(payload) {
    const res = await fetch("/api/tracker/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Error");
    return data;
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});
