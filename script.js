// Utility selectors
function $(selector) {
  return document.querySelector(selector);
}
function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

// ----- TABS -----
function setupTabs() {
  const buttons = $all('.tab-btn');
  const views = $all('.tab-view');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      views.forEach((v) => v.classList.remove('active'));
      const target = document.getElementById(tab);
      if (target) target.classList.add('active');
    });
  });
}

// ----- SUMO GAME -----
let playerStamina = 100;
let cpuStamina = 100;
let playerBalance = 100;
let cpuBalance = 100;

function resetBout() {
  playerStamina = 100;
  cpuStamina = 100;
  playerBalance = 100;
  cpuBalance = 100;
  updateBars();
  const msg = $('#roundMessage');
  if (msg) msg.textContent = 'Press "Charge" to clash!';
  const playerToken = $('#playerToken');
  const cpuToken = $('#cpuToken');
  if (playerToken) playerToken.style.left = '35%';
  if (cpuToken) cpuToken.style.left = '65%';
}

function updateBars() {
  const pStamBar = $('#playerStaminaBar');
  const cStamBar = $('#cpuStaminaBar');
  const pBalBar = $('#playerBalanceBar');
  const cBalBar = $('#cpuBalanceBar');
  const pStamVal = $('#playerStaminaValue');
  const cStamVal = $('#cpuStaminaValue');
  const pBalVal = $('#playerBalanceValue');
  const cBalVal = $('#cpuBalanceValue');

  if (pStamBar) pStamBar.style.width = Math.max(0, playerStamina) + '%';
  if (cStamBar) cStamBar.style.width = Math.max(0, cpuStamina) + '%';
  if (pBalBar) pBalBar.style.width = Math.max(0, playerBalance) + '%';
  if (cBalBar) cBalBar.style.width = Math.max(0, cpuBalance) + '%';

  if (pStamVal) pStamVal.textContent = Math.max(0, Math.round(playerStamina));
  if (cStamVal) cStamVal.textContent = Math.max(0, Math.round(cpuStamina));
  if (pBalVal) pBalVal.textContent = Math.max(0, Math.round(playerBalance));
  if (cBalVal) cBalVal.textContent = Math.max(0, Math.round(cpuBalance));
}

function performCharge() {
  if (playerStamina <= 0 || cpuStamina <= 0) return;

  // Randomize balance each clash to simulate footing
  playerBalance = 60 + Math.random() * 40; // 60-100
  cpuBalance = 40 + Math.random() * 60; // 40-100

  const pPower = playerBalance * (0.7 + Math.random() * 0.6);
  const cPower = cpuBalance * (0.7 + Math.random() * 0.6);

  let message = '';
  const playerToken = $('#playerToken');
  const cpuToken = $('#cpuToken');

  if (pPower > cPower) {
    const diff = (pPower - cPower) / 20;
    cpuStamina -= diff * 8;
    message = 'You drove your opponent back!';
    if (cpuToken) {
      const current = parseFloat(cpuToken.style.left || '65');
      cpuToken.style.left = Math.min(80, current + diff) + '%';
    }
  } else if (cPower > pPower) {
    const diff = (cPower - pPower) / 20;
    playerStamina -= diff * 8;
    message = 'You get pushed toward the edge!';
    if (playerToken) {
      const current = parseFloat(playerToken.style.left || '35');
      playerToken.style.left = Math.max(20, current - diff) + '%';
    }
  } else {
    message = 'Even clash! No one moves.';
  }

  updateBars();

  const msgEl = $('#roundMessage');
  if (msgEl) msgEl.textContent = message;

  if (playerStamina <= 0 || cpuStamina <= 0) {
    const playerName = localStorage.getItem('displayName') || 'Guest Sumo';
    let result;
    if (playerStamina <= 0 && cpuStamina <= 0) {
      result = 'Double fall! Bout is a draw.';
    } else if (playerStamina <= 0) {
      result = `${playerName} is pushed out of the ring. You lose this bout.`;
    } else {
      result = `${playerName} forces the opponent out! Victory!`;
      bumpLocalWins();
    }
    if (msgEl) msgEl.textContent = result;
  }
}

function setupSumoGame() {
  const chargeButton = $('#chargeButton');
  const resetButton = $('#resetMatchButton');
  if (chargeButton) {
    chargeButton.addEventListener('click', performCharge);
  }
  if (resetButton) {
    resetButton.addEventListener('click', resetBout);
  }

  const spaceToggle = $('#spaceToCharge');
  document.addEventListener('keydown', (e) => {
    const allowed = !spaceToggle || spaceToggle.checked;
    if (e.code === 'Space' && allowed) {
      // Only trigger when on home page with game
      if ($('#gameView') && $('#gameView').classList.contains('active')) {
        e.preventDefault();
        performCharge();
      }
    }
  });

  resetBout();
}

// ----- MINI-SLOTS (BOTTOM-RIGHT DROP-UP) -----

const MINI_SYMBOLS = ['相', '力', '土', '勝', '星'];

let miniBet = 5;
let miniTokens = 250;
let miniStreak = 0;

function updateMiniMeters() {
  const streakEl = $('#miniStreakValue');
  const tokenEl = $('#miniTokenValue');
  if (streakEl) streakEl.textContent = String(miniStreak);
  if (tokenEl) tokenEl.textContent = String(miniTokens);
}

function fillMiniReels() {
  const grid = $('#miniReelsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const cell = document.createElement('div');
    cell.className = 'mini-cell';
    cell.textContent = MINI_SYMBOLS[Math.floor(Math.random() * MINI_SYMBOLS.length)];
    grid.appendChild(cell);
  }
}

function spinMiniReels() {
  const grid = $('#miniReelsGrid');
  if (!grid) return;
  if (miniTokens < miniBet) {
    alert('Not enough tokens to bet that amount.');
    return;
  }
  miniTokens -= miniBet;
  updateMiniMeters();

  const cells = Array.from(grid.children);
  cells.forEach((cell) => {
    cell.textContent = MINI_SYMBOLS[Math.floor(Math.random() * MINI_SYMBOLS.length)];
  });

  const symbols = cells.map((c) => c.textContent);
  if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
    miniStreak += 1;
    miniTokens += miniBet * 5;
  } else {
    miniStreak = 0;
  }
  updateMiniMeters();
}

function setupMiniSlots() {
  const trigger = $('#miniTrigger');
  const panel = $('#miniPanel');
  const close = $('#miniClose');
  const betToggle = $('#miniBetToggle');
  const betMenu = $('#miniBetMenu');
  const betValue = $('#miniBetValue');
  const spinBtn = $('#miniPushSpin');

  if (!trigger || !panel) return;

  trigger.addEventListener('click', () => {
    panel.classList.toggle('open');
  });
  if (close) {
    close.addEventListener('click', () => panel.classList.remove('open'));
  }

  if (betToggle && betMenu && betValue) {
    betToggle.addEventListener('click', () => {
      betMenu.classList.toggle('open');
    });

    betMenu.addEventListener('click', (e) => {
      const li = e.target.closest('li[data-bet]');
      if (!li) return;
      miniBet = Number(li.dataset.bet);
      betValue.textContent = String(miniBet);
      betMenu.classList.remove('open');
    });

    document.addEventListener('click', (e) => {
      if (!betMenu.contains(e.target) && e.target !== betToggle) {
        betMenu.classList.remove('open');
      }
    });
  }

  if (spinBtn) {
    spinBtn.addEventListener('click', spinMiniReels);
  }

  fillMiniReels();
  updateMiniMeters();
}

// ----- PROFILE STORAGE -----

function loadProfileFromStorage() {
  const usernameInput = $('#usernameInput');
  const displayNameInput = $('#displayNameInput');
  const usernameHint = $('#usernameHint');
  const bodyType = $('#bodyType');
  const beltColor = $('#beltColor');
  const auraStyle = $('#auraStyle');

  const username = localStorage.getItem('username') || '';
  const displayName = localStorage.getItem('displayName') || '';

  if (usernameInput) usernameInput.value = username;
  if (displayNameInput) displayNameInput.value = displayName;

  if (usernameHint) {
    const changedAt = localStorage.getItem('usernameChangedAt');
    if (changedAt) {
      const diffMs = Date.now() - Number(changedAt);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        const remaining = Math.ceil(7 - diffDays);
        usernameHint.textContent = `You can change your username again in about ${remaining} day(s).`;
      } else {
        usernameHint.textContent =
          'You can change your username; changes are allowed once per week.';
      }
    } else {
      usernameHint.textContent =
        'You can change your username; changes are allowed once per week.';
    }
  }

  if (bodyType) bodyType.value = localStorage.getItem('bodyType') || 'classic';
  if (beltColor) beltColor.value = localStorage.getItem('beltColor') || 'crimson';
  if (auraStyle) auraStyle.value = localStorage.getItem('auraStyle') || 'none';

  updateAvatarPreview();
  updatePlayerName();
}

function setupProfileInputs() {
  const usernameInput = $('#usernameInput');
  const displayNameInput = $('#displayNameInput');
  const usernameHint = $('#usernameHint');
  const bodyType = $('#bodyType');
  const beltColor = $('#beltColor');
  const auraStyle = $('#auraStyle');

  if (usernameInput) {
    usernameInput.addEventListener('change', () => {
      const changedAt = localStorage.getItem('usernameChangedAt');
      let canChange = true;
      if (changedAt) {
        const diffMs = Date.now() - Number(changedAt);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays < 7) {
          canChange = false;
          if (usernameHint) {
            const remaining = Math.ceil(7 - diffDays);
            usernameHint.textContent = `Username locked. You can change it in about ${remaining} day(s).`;
          }
        }
      }
      if (!canChange) {
        usernameInput.value = localStorage.getItem('username') || '';
        return;
      }
      const value = usernameInput.value.trim().slice(0, 64);
      usernameInput.value = value;
      localStorage.setItem('username', value);
      localStorage.setItem('usernameChangedAt', String(Date.now()));
      if (usernameHint) {
        usernameHint.textContent =
          'Username updated. You can change it again in about 7 days.';
      }
    });
  }

  if (displayNameInput) {
    displayNameInput.addEventListener('input', () => {
      const value = displayNameInput.value.slice(0, 64);
      displayNameInput.value = value;
      localStorage.setItem('displayName', value);
      updatePlayerName();
    });
  }

  [bodyType, beltColor, auraStyle].forEach((select) => {
    if (!select) return;
    select.addEventListener('change', () => {
      localStorage.setItem(select.id, select.value);
      updateAvatarPreview();
    });
  });
}

function updateAvatarPreview() {
  const avatar = $('#avatarPreview');
  if (!avatar) return;
  const beltColor = localStorage.getItem('beltColor') || 'crimson';
  const auraStyle = localStorage.getItem('auraStyle') || 'none';

  avatar.style.boxShadow =
    auraStyle === 'none'
      ? '0 18px 30px rgba(0,0,0,0.7)'
      : '0 0 24px rgba(255, 206, 120, 0.9), 0 18px 30px rgba(0,0,0,0.7)';

  const belt = avatar.querySelector('.avatar-belt');
  if (belt) {
    const map = {
      crimson: ['#8d1f1f', '#3c0505'],
      gold: ['#f7d35e', '#ad7d08'],
      indigo: ['#3f51b5', '#1a237e'],
      onyx: ['#444', '#111'],
    };
    const [c1, c2] = map[beltColor] || map.crimson;
    belt.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
  }
}

function updatePlayerName() {
  const name = localStorage.getItem('displayName') || 'Guest Sumo';
  const playerNameEl = $('#playerName');
  if (playerNameEl) playerNameEl.textContent = name || 'Guest Sumo';
}

// ----- SETTINGS MODAL -----

function setupSettingsModal() {
  const openBtn = $('#openSettings');
  const closeBtn = $('#closeSettings');
  const modal = $('#settingsModal');
  const saveBtn = $('#saveSettings');
  const resetBtn = $('#resetProfile');

  if (!modal) return;

  const toggle = (show) => {
    modal.classList.toggle('hidden', !show);
  };

  if (openBtn) openBtn.addEventListener('click', () => toggle(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggle(false));
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
      toggle(false);
    }
  });

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const theme = $('#themeSelect')?.value || 'dark';
      localStorage.setItem('theme', theme);
      toggle(false);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!confirm('Reset all local profile data?')) return;
      localStorage.removeItem('username');
      localStorage.removeItem('displayName');
      localStorage.removeItem('usernameChangedAt');
      ['bodyType', 'beltColor', 'auraStyle'].forEach((key) =>
        localStorage.removeItem(key)
      );
      loadProfileFromStorage();
    });
  }
}

// ----- LEADERBOARD -----

function bumpLocalWins() {
  const wins = Number(localStorage.getItem('sumoWins') || '0') + 1;
  localStorage.setItem('sumoWins', String(wins));
  renderLeaderboard();
}

function renderLeaderboard() {
  const body = $('#leaderboardBody');
  if (!body) return;

  const playerName = localStorage.getItem('displayName') || 'Guest Sumo';
  const localWins = Number(localStorage.getItem('sumoWins') || '0');

  const entries = [
    { name: 'Iron Mawashi', wins: 18 },
    { name: 'Thunder Dohyo', wins: 13 },
    { name: 'Crimson Avalanche', wins: 9 },
    { name: playerName || 'Guest Sumo', wins: localWins },
  ];

  body.innerHTML = '';
  entries
    .sort((a, b) => b.wins - a.wins)
    .forEach((row, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i + 1}</td><td>${row.name}</td><td>${row.wins}</td>`;
      body.appendChild(tr);
    });
}

// ----- VISITORS (LOCAL APPROXIMATION) -----

function setupVisitors() {
  const onlineEl = $('#onlineVisitors');
  const allTimeEl = $('#allTimeVisitors');
  if (!onlineEl || !allTimeEl) return;

  const ALL_KEY = 'sumo_all_time_visitors';
  const SESSION_KEY = 'sumo_session_id';

  if (!sessionStorage.getItem(SESSION_KEY)) {
    sessionStorage.setItem(SESSION_KEY, String(Date.now()));
    const current = Number(localStorage.getItem(ALL_KEY) || '0');
    localStorage.setItem(ALL_KEY, String(current + 1));
  }

  const allTime = Number(localStorage.getItem(ALL_KEY) || '0');
  allTimeEl.textContent = String(allTime);
  onlineEl.textContent = '1';
}

// ----- INIT -----

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupVisitors();
  setupSumoGame();
  setupMiniSlots();
  renderLeaderboard();

  // Profile-specific behaviour
  if (document.body.contains($('#usernameInput'))) {
    loadProfileFromStorage();
    setupProfileInputs();
    setupSettingsModal();
  } else {
    // Home page also needs player name synced if profile exists
    updatePlayerName();
  }
});
