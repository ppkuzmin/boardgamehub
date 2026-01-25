document.addEventListener("DOMContentLoaded", () => {
  // NOTE: avoid global API_BASE name (auth.js already declares it)
  const TRACKER_API_BASE = "http://localhost:8080/api";

  const DEMO_GAMES = [
    { id: 1, name: "Dune Imperium" },
    { id: 2, name: "Carcassonne" },
    { id: 3, name: "Slay the Spire" },
    { id: 4, name: "Catan" }
  ];

  const STORAGE_KEY = "boardgame-sessions";

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

  let sessions = loadSessions();
  let chartInstance = null;
  let gamesCache = [];

  // ---------- INIT ----------
  if (!gameForm || !gameSelect || !playersContainer) {
    console.warn("Tracker: missing main elements in HTML.");
    return;
  }

  // date default
  const today = new Date().toISOString().split("T")[0];
  if (gameDateInput) gameDateInput.value = today;

  const initialCount = numPlayersInput ? (parseInt(numPlayersInput.value, 10) || 2) : 2;
  buildPlayerRows(initialCount);

  // Load games into dropdown (backend or demo)
  loadGamesIntoSelect().then(() => {
    // render UI after games load (so names are available)
    renderHistory();
    populateGameFilter();
    updateChart();
  });

  // ---------- PLAYERS COUNT ----------
  if (numPlayersInput) {
    numPlayersInput.addEventListener("change", () => {
      let count = parseInt(numPlayersInput.value, 10);
      if (isNaN(count) || count < 1) count = 1;
      if (count > 10) count = 10;
      numPlayersInput.value = count;
      buildPlayerRows(count);
    });
  }

  function buildPlayerRows(count) {
    playersContainer.innerHTML = "";
    const medalEmojis = ["🥇", "🥈", "🥉"];

    for (let i = 0; i < count; i++) {
      const rank = i + 1;

      const row = document.createElement("div");
      row.className = "player-row";

      const labelSpan = document.createElement("span");
      labelSpan.className = "player-rank";
      labelSpan.textContent = medalEmojis[i] || `${rank}.`;

      const input = document.createElement("input");
      input.type = "text";
      input.className = "player-name-input";
      input.placeholder = `Име на играч ${rank}`;

      row.appendChild(labelSpan);
      row.appendChild(input);
      playersContainer.appendChild(row);
    }
  }

  // ---------- LOAD GAMES ----------
  async function loadGames() {
    try {
      const res = await fetch(`${TRACKER_API_BASE}/games`);
      if (!res.ok) throw new Error("Failed");
      const items = await res.json();
      const normalized = (Array.isArray(items) ? items : []).map(g => ({
        id: g.id,
        name: g.name
      })).filter(g => g.id != null && g.name);
      if (!normalized.length) throw new Error("Empty games");
      return { mode: "backend", items: normalized };
    } catch {
      return { mode: "demo", items: DEMO_GAMES };
    }
  }

  async function loadGamesIntoSelect() {
    const data = await loadGames();
    gamesCache = data.items;

    gameSelect.innerHTML = "";
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = data.mode === "backend" ? "Избери игра" : "Избери игра (demo)";
    opt0.disabled = false;
    opt0.selected = true;
    gameSelect.appendChild(opt0);

    gamesCache.forEach(g => {
      const opt = document.createElement("option");
      opt.value = String(g.id);
      opt.textContent = g.name;
      gameSelect.appendChild(opt);
    });

    // if user had sessions already, try to preselect last used game
    const last = sessions.length ? sessions[sessions.length - 1] : null;
    if (last && last.gameId) {
      const exists = gamesCache.some(g => String(g.id) === String(last.gameId));
      if (exists) gameSelect.value = String(last.gameId);
    }
  }

  function findGameNameById(id) {
    const g = gamesCache.find(x => String(x.id) === String(id));
    return g ? g.name : "";
  }

  // ---------- FORM SUBMIT ----------
  gameForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const gameId = gameSelect.value;
    const gameName = gameId ? (findGameNameById(gameId) || gameSelect.options[gameSelect.selectedIndex]?.textContent) : "";

    const gameDate = (gameDateInput && gameDateInput.value) ? gameDateInput.value : today;

    if (!gameId) {
      alert("Моля, избери игра.");
      return;
    }

    const playerInputs = Array.from(playersContainer.querySelectorAll(".player-name-input"));
    const players = [];
    playerInputs.forEach((input, index) => {
      const name = input.value.trim();
      if (name) {
        players.push({ name, rank: index + 1 });
      }
    });

    if (!players.length) {
      alert("Моля, въведи поне един участник.");
      return;
    }

    const session = {
      id: Date.now(),
      date: gameDate,
      gameId: Number(gameId),
      gameName: String(gameName || ""),
      players
    };

    sessions.push(session);
    saveSessions();

    // reset
    gameForm.reset();
    if (gameDateInput) gameDateInput.value = today;
    if (numPlayersInput) numPlayersInput.value = 2;
    buildPlayerRows(2);

    // keep selection on last used game
    gameSelect.value = String(session.gameId);

    renderHistory();
    populateGameFilter();
    updateChart();

    alert("Играта е записана!");
  });

  // ---------- HISTORY RENDERING ----------
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
    const sorted = [...sessions].sort((a, b) => b.id - a.id);

    sorted.forEach(session => {
      const card = document.createElement("div");
      card.className = "history-item";

      const header = document.createElement("div");
      header.className = "history-item-header";
      const gameLabel = session.gameName || findGameNameById(session.gameId) || `Game #${session.gameId}`;
      header.innerHTML = `
        <strong>${escapeHtml(gameLabel)}</strong>
        <span class="history-date">${escapeHtml(session.date)}</span>
      `;
      card.appendChild(header);

      const playersWrapper = document.createElement("div");
      playersWrapper.className = "history-players";

      session.players.forEach(player => {
        const line = document.createElement("div");
        line.className = "history-player-line";

        const rankSpan = document.createElement("span");
        rankSpan.className = "history-player-rank";
        rankSpan.textContent = medalEmojis[player.rank - 1] || `${player.rank}.`;

        const nameSpan = document.createElement("span");
        nameSpan.className = "history-player-name";
        nameSpan.textContent = player.name;

        const placeSpan = document.createElement("span");
        placeSpan.className = "history-player-place";
        placeSpan.textContent = `Място: ${player.rank}`;

        if (player.rank === 1) line.classList.add("winner");
        else if (player.rank === 2) line.classList.add("second");
        else if (player.rank === 3) line.classList.add("third");

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
      if (!sessions.length) return;
      if (!confirm("Сигурен ли си, че искаш да изчистиш цялата история?")) return;

      sessions = [];
      saveSessions();
      renderHistory();
      populateGameFilter();
      updateChart();
    });
  }

  // ---------- STATISTICS ----------
  if (gameFilterSelect) {
    gameFilterSelect.addEventListener("change", updateChart);
  }

  function populateGameFilter() {
    if (!gameFilterSelect) return;

    const games = Array.from(new Set(sessions.map(s => s.gameName || findGameNameById(s.gameId) || `Game #${s.gameId}`))).sort();

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

    sessions.forEach(session => {
      const gameLabel = session.gameName || findGameNameById(session.gameId) || `Game #${session.gameId}`;
      if (gameFilter !== "all" && gameLabel !== gameFilter) return;

      session.players
        .filter(p => p.rank === 1)
        .forEach(p => {
          wins.set(p.name, (wins.get(p.name) || 0) + 1);
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
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: "rgba(212, 122, 52, 0.45)",
          borderColor: "rgba(212, 122, 52, 1)",
          borderWidth: 1,
          borderRadius: 12,
          maxBarThickness: 40
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 10 },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: gameFilter === "all"
              ? "Общ брой победи (всички игри)"
              : `Победи в играта ${gameFilter}`
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.raw} победи`
            }
          }
        },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
          y: { ticks: { autoSkip: false, font: { size: 12 } } }
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

  // ---------- STORAGE HELPERS ----------
  function saveSessions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }

  function loadSessions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});
