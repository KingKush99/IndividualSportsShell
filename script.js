// Utility: show sections
function showSection(id) {
  document.querySelectorAll('.page-section').forEach(sec => {
    sec.classList.remove('active');
  });
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

// Game / leaderboard toggle
function showGamePanel(which) {
  const gamePanel = document.getElementById('gamePanel');
  const leaderboardPanel = document.getElementById('leaderboardPanel');
  const gameBtn = document.getElementById('gameTabBtn');
  const lbBtn = document.getElementById('leaderboardTabBtn');
  if (!gamePanel || !leaderboardPanel) return;

  if (which === 'game') {
    gamePanel.classList.add('active');
    leaderboardPanel.classList.remove('active');
    gameBtn.classList.add('active');
    lbBtn.classList.remove('active');
  } else {
    gamePanel.classList.remove('active');
    leaderboardPanel.classList.add('active');
    gameBtn.classList.remove('active');
    lbBtn.classList.add('active');
  }
}

// Hamburger menu
function toggleHamburgerMenu() {
  const menu = document.getElementById('hamburgerMenu');
  if (menu) menu.classList.toggle('hidden');
}

function openPurchaseModal(type) {
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('purchaseModal');
  const title = document.getElementById('purchaseTitle');
  if (!overlay || !modal || !title) return;
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
  let label = 'Purchase';
  if (type === 'fiat') label = 'Buy with Fiat';
  else if (type === 'crypto') label = 'Buy with Crypto';
  else if (type === 'gems') label = 'Buy Gems';
  title.textContent = label;
}

function openAdsModal() {
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('adsModal');
  if (!overlay || !modal) return;
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
}

function openFooterModal(titleText) {
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('footerModal');
  const title = document.getElementById('footerModalTitle');
  const body = document.getElementById('footerModalBody');
  if (!overlay || !modal) return;
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
  title.textContent = titleText;
  body.textContent = `More information about ${titleText} will appear here.`;
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.classList.add('hidden');
}

// Site-language selector (placeholder)
function changeSiteLanguage() {
  const sel = document.getElementById('siteLanguage');
  if (!sel) return;
  const lang = sel.value;
  console.log('Site language changed to', lang);
}

// Odometer
function createOdometer(el, value) {
  const s = String(value);
  el.innerHTML = '';
  for (let i = 0; i < s.length; i++) {
    const span = document.createElement('span');
    span.className = 'odometer-digit' + (i === s.length - 1 ? ' last' : '');
    span.textContent = s[i];
    el.appendChild(span);
  }
}

function animateOdometer(el, start, end, duration) {
  const startTime = performance.now();
  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const current = Math.floor(start + (end - start) * t);
    createOdometer(el, current);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Chatbot
const chatbotWelcomeByLang = {
  en: 'Welcome to Sumo Sumo! Ask me about the game, profile, or slots.',
  fr: 'Bienvenue à Sumo Sumo ! Demande-moi quelque chose sur le jeu, le profil ou les machines à sous.',
  es: 'Bienvenido a Sumo Sumo. Pregúntame sobre el juego, el perfil o las tragamonedas.',
  pt: 'Bem-vindo ao Sumo Sumo! Pergunte sobre o jogo, perfil ou slots.',
  ru: 'Добро пожаловать в Sumo Sumo! Спросите меня об игре, профиле или слотах.',
  ar: 'مرحبًا بك في سومو سومو! اسألني عن اللعبة أو الملف الشخصي أو ماكينات السلوت.',
  bn: 'সুমো সুমোতে স্বাগতম! গেম, প্রোফাইল বা স্লট নিয়ে প্রশ্ন করুন।',
  zh: '欢迎来到相扑相扑！可以问我关于游戏、个人资料或老虎机的问题。',
  nl: 'Welkom bij Sumo Sumo! Stel vragen over het spel, je profiel of de slots.',
  hi: 'सूमो सूमो में आपका स्वागत है! खेल, प्रोफाइल या स्लॉट्स के बारे में पूछें।'
};

let currentChatLang = 'en';

function ensureChatWelcome() {
  const panel = document.getElementById('chatbotPanel');
  const msgContainer = document.getElementById('chatbotMessages');
  if (!panel || !msgContainer) return;
  msgContainer.innerHTML = '';
  addChatbotMessage('bot', chatbotWelcomeByLang[currentChatLang] || chatbotWelcomeByLang.en);
}

function toggleChatbot() {
  const panel = document.getElementById('chatbotPanel');
  if (!panel) return;
  const hidden = panel.classList.contains('hidden');
  document.getElementById('chatbotPanel').classList.toggle('hidden');
  if (hidden) {
    ensureChatWelcome();
  }
}

function updateChatbotLanguage() {
  const sel = document.getElementById('chatbotLanguage');
  if (!sel) return;
  currentChatLang = sel.value;
  ensureChatWelcome();
}

function addChatbotMessage(who, text) {
  const cont = document.getElementById('chatbotMessages');
  if (!cont) return;
  const div = document.createElement('div');
  div.className = 'chatbot-message ' + who;
  div.textContent = text;
  cont.appendChild(div);
  cont.scrollTop = cont.scrollHeight;
}

function sendChatbotMessage() {
  const input = document.getElementById('chatbotInput');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';
  addChatbotMessage('user', text);

  // Simple site-aware reply
  let reply;
  const lower = text.toLowerCase();
  if (lower.includes('controls') || lower.includes('move')) {
    reply = 'Use your chosen control scheme (WASD or arrows) to move around the ring, space to jump, and K/P/O/I/L for combos.';
  } else if (lower.includes('leaderboard')) {
    reply = 'The Game Leaderboard tab shows usernames ranked by wins and XP.';
  } else if (lower.includes('slots') || lower.includes('mini')) {
    reply = 'Mini Slots lives in the bottom-right. Pick your bet, choose reels, pull the lever, or enable Auto Spin.';
  } else if (lower.includes('profile') || lower.includes('customize')) {
    reply = 'In your profile you can customize your sumo body, hair, outfit, and distribute 9 skill points.';
  } else {
    reply = 'I am your Sumo helper. Ask me about the arena, the sumo game, your profile, or mini slots.';
  }

  addChatbotMessage('bot', reply);
}

// Mini Slots

let currentBet = 10;
let currentReels = 3;
let autoSpinInterval = null;

function toggleMiniSlots() {
  const panel = document.getElementById('miniSlotsPanel');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    renderReels();
  } else {
    if (autoSpinInterval) {
      clearInterval(autoSpinInterval);
      autoSpinInterval = null;
      const toggle = document.getElementById('autoSpinToggle');
      if (toggle) toggle.checked = false;
    }
  }
}

function toggleDropup(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('hidden');
}

function setBet(value) {
  currentBet = value;
  const span = document.getElementById('currentBet');
  if (span) span.textContent = value;
}

function setReelCount(count) {
  currentReels = count;
  const span = document.getElementById('currentReels');
  if (span) span.textContent = count;
  renderReels();
}

function renderReels() {
  const cont = document.getElementById('reelsDisplay');
  if (!cont) return;
  cont.innerHTML = '';
  for (let i = 0; i < currentReels; i++) {
    const d = document.createElement('div');
    d.className = 'reel';
    d.textContent = '7';
    cont.appendChild(d);
  }
}

function pullLever() {
  const lever = document.getElementById('lever');
  if (!lever) return;
  lever.classList.add('lever-pulled');
  setTimeout(() => {
    lever.classList.remove('lever-pulled');
  }, 180);
  spinReels();
}

function spinReels() {
  const cont = document.getElementById('reelsDisplay');
  if (!cont) return;
  const reels = cont.querySelectorAll('.reel');
  reels.forEach((r, idx) => {
    setTimeout(() => {
      const val = Math.floor(Math.random() * 9);
      r.textContent = val;
    }, idx * 80);
  });
}

function handleAutoSpinChange() {
  const toggle = document.getElementById('autoSpinToggle');
  if (!toggle) return;
  if (toggle.checked) {
    autoSpinInterval = setInterval(() => {
      spinReels();
    }, 1200);
  } else {
    if (autoSpinInterval) {
      clearInterval(autoSpinInterval);
      autoSpinInterval = null;
    }
  }
}

// GAME LOGIC

let canvas, ctx;
let player, cpu, referee;
let spectators = [];
let stadiumLayers = [];
let keys = {};
let gameLastTime = 0;

function initGame() {
  canvas = document.getElementById('sumoCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  const ringRadius = 150;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 + 40;

  player = {
    x: centerX - 40,
    y: centerY,
    radius: 26,
    color: '#ffcc66',
    dir: 0,
    hunched: true
  };
  cpu = {
    x: centerX + 40,
    y: centerY,
    radius: 26,
    color: '#66ccff',
    dir: Math.PI,
    hunched: true
  };
  referee = {
    x: centerX,
    y: centerY - ringRadius - 35,
    width: 26,
    height: 60,
    color: '#f5f5f5'
  };

  spectators = [];
  const crowdRadius = ringRadius + 60;
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    spectators.push({
      angle,
      radius: crowdRadius + (i % 2 === 0 ? 0 : 18),
      hairColor: i % 3 === 0 ? '#ffdfba' : i % 3 === 1 ? '#c56cff' : '#4dd2ff',
      shirtColor: i % 4 === 0 ? '#ff5555' : i % 4 === 1 ? '#55ff55' : i % 4 === 2 ? '#5555ff' : '#ffcc33'
    });
  }

  // layered stadium
  stadiumLayers = [];
  for (let j = 0; j < 3; j++) {
    stadiumLayers.push({
      radius: ringRadius + 80 + j * 22,
      color: j === 2 ? '#2b2e45' : '#1a1c2b'
    });
  }

  window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  populateLeaderboard();
  requestAnimationFrame(gameLoop);
}

function populateLeaderboard() {
  const body = document.getElementById('leaderboardBody');
  if (!body) return;
  const sample = [
    { username: 'IronBelly', wins: 42, xp: 5600 },
    { username: 'RingGhost', wins: 37, xp: 4900 },
    { username: 'TatamiTiger', wins: 31, xp: 4300 },
    { username: 'SandStorm', wins: 22, xp: 3100 },
    { username: 'RopeEdge', wins: 15, xp: 2100 }
  ];
  body.innerHTML = '';
  sample.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx + 1}</td><td>${row.username}</td><td>${row.wins}</td><td>${row.xp}</td>`;
    body.appendChild(tr);
  });
}

function gameLoop(timestamp) {
  if (!ctx) return;
  const dt = (timestamp - gameLastTime) / 1000;
  gameLastTime = timestamp;

  updateGame(dt);
  drawGame();

  requestAnimationFrame(gameLoop);
}

function updateGame(dt) {
  const speed = 120;
  if (!player || !cpu) return;

  // controls from settings
  const controls = localStorage.getItem('sumoControls') || 'wasd';
  if (controls === 'wasd') {
    if (keys['w']) moveFighter(player, 0, -speed * dt);
    if (keys['s']) moveFighter(player, 0, speed * dt);
    if (keys['a']) moveFighter(player, -speed * dt, 0);
    if (keys['d']) moveFighter(player, speed * dt, 0);
  } else {
    if (keys['arrowup']) moveFighter(player, 0, -speed * dt);
    if (keys['arrowdown']) moveFighter(player, 0, speed * dt);
    if (keys['arrowleft']) moveFighter(player, -speed * dt, 0);
    if (keys['arrowright']) moveFighter(player, speed * dt, 0);
  }

  // CPU tries to close distance
  const dx = player.x - cpu.x;
  const dy = player.y - cpu.y;
  const dist = Math.hypot(dx, dy);
  const cpuSpeed = 80;
  if (dist > 40) {
    cpu.x += (dx / dist) * cpuSpeed * dt;
    cpu.y += (dy / dist) * cpuSpeed * dt;
  }

  // simple attack knockback when close & pressing combo keys
  if (dist < player.radius + cpu.radius + 6) {
    const comboPressed = keys['k'] || keys['p'] || keys['o'] || keys['i'] || keys['l'];
    if (comboPressed) {
      const knock = 50;
      cpu.x += (dx / dist) * knock;
      cpu.y += (dy / dist) * knock;
    }
  }

  // keep fighters inside ring
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 + 40;
  const ringRadius = 150 - 10;

  [player, cpu].forEach(f => {
    const rx = f.x - centerX;
    const ry = f.y - centerY;
    const rd = Math.hypot(rx, ry);
    if (rd > ringRadius) {
      const factor = ringRadius / rd;
      f.x = centerX + rx * factor;
      f.y = centerY + ry * factor;
    }
  });
}

function moveFighter(f, dx, dy) {
  f.x += dx;
  f.y += dy;
}

// Drawing helpers

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 + 40;
  const ringRadius = 150;

  // Background mat
  const grad = ctx.createRadialGradient(centerX, centerY - 100, 50, centerX, centerY + 150, 400);
  grad.addColorStop(0, '#2f3450');
  grad.addColorStop(1, '#050608');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stadium layers
  stadiumLayers.forEach(layer => {
    ctx.beginPath();
    ctx.arc(centerX, centerY, layer.radius, 0, Math.PI * 2);
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = 20;
    ctx.stroke();
  });

  // Sand ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, ringRadius + 10, 0, Math.PI * 2);
  ctx.fillStyle = '#c2a878';
  ctx.fill();

  // Dohyo circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#f6e0b3';
  ctx.fill();

  // Spectators
  spectators.forEach(spec => {
    const sx = centerX + Math.cos(spec.angle) * spec.radius;
    const sy = centerY + Math.sin(spec.angle) * spec.radius;

    // chair
    ctx.fillStyle = '#1b2033';
    ctx.fillRect(sx - 7, sy + 8, 14, 6);

    // legs
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - 4, sy + 8);
    ctx.lineTo(sx - 4, sy + 16);
    ctx.moveTo(sx + 4, sy + 8);
    ctx.lineTo(sx + 4, sy + 16);
    ctx.stroke();

    // body
    ctx.fillStyle = spec.shirtColor;
    ctx.fillRect(sx - 6, sy - 2, 12, 12);

    // arms
    ctx.strokeStyle = spec.shirtColor;
    ctx.beginPath();
    ctx.moveTo(sx - 6, sy + 2);
    ctx.lineTo(sx - 10, sy + 4);
    ctx.moveTo(sx + 6, sy + 2);
    ctx.lineTo(sx + 10, sy + 4);
    ctx.stroke();

    // head
    ctx.beginPath();
    ctx.arc(sx, sy - 7, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd9b3';
    ctx.fill();

    // hair
    ctx.fillStyle = spec.hairColor;
    ctx.beginPath();
    ctx.arc(sx, sy - 9, 6, Math.PI, 0);
    ctx.fill();

    // eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(sx - 2, sy - 7, 1, 0, Math.PI * 2);
    ctx.arc(sx + 2, sy - 7, 1, 0, Math.PI * 2);
    ctx.fill();

    // mouth
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.arc(sx, sy - 4, 2.5, 0, Math.PI);
    ctx.stroke();
  });

  drawFighter(player, true);
  drawFighter(cpu, false);
  drawReferee();
}

function drawFighter(f, isPlayer) {
  // hunched body
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(1.1, 0.9);

  // legs
  ctx.fillStyle = '#ffddaa';
  ctx.fillRect(-18, 12, 12, 18);
  ctx.fillRect(6, 12, 12, 18);

  // feet
  ctx.fillRect(-18, 28, 16, 5);
  ctx.fillRect(6, 28, 16, 5);

  // torso
  ctx.fillStyle = f.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // mawashi belt
  ctx.fillStyle = isPlayer ? '#b3003c' : '#0040b3';
  ctx.fillRect(-20, 4, 40, 8);

  // arms
  ctx.fillStyle = '#ffddaa';
  ctx.beginPath();
  ctx.ellipse(-26, -2, 7, 10, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(26, -2, 7, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // chest / nipples
  ctx.fillStyle = '#ffddaa';
  ctx.beginPath();
  ctx.arc(-8, -4, 2, 0, Math.PI * 2);
  ctx.arc(8, -4, 2, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.beginPath();
  ctx.arc(0, -26, 12, 0, Math.PI * 2);
  ctx.fill();

  // hair
  ctx.fillStyle = '#33220f';
  ctx.beginPath();
  ctx.arc(0, -28, 12, Math.PI, 0);
  ctx.fill();
  // topknot
  ctx.fillRect(-2, -42, 4, 10);
  ctx.beginPath();
  ctx.arc(0, -43, 4, 0, Math.PI * 2);
  ctx.fill();

  // face
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-4, -28, 1.5, 0, Math.PI * 2);
  ctx.arc(4, -28, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.beginPath();
  ctx.arc(0, -24, 4, 0, Math.PI);
  ctx.stroke();

  ctx.restore();
}

function drawReferee() {
  const r = referee;
  ctx.save();
  ctx.translate(r.x, r.y);

  // legs
  ctx.fillStyle = '#555';
  ctx.fillRect(-8, 18, 6, 16);
  ctx.fillRect(2, 18, 6, 16);
  ctx.fillRect(-8, 34, 10, 4);
  ctx.fillRect(2, 34, 10, 4);

  // torso
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(-10, -6, 20, 24);

  // stripes
  ctx.fillStyle = '#111';
  ctx.fillRect(-8, -6, 2, 24);
  ctx.fillRect(-2, -6, 2, 24);
  ctx.fillRect(4, -6, 2, 24);

  // arms
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(-16, -4, 6, 18);
  ctx.fillRect(10, -4, 6, 18);

  // flag in right hand
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(14, -10, 16, 12);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, -4);
  ctx.lineTo(10, -16);
  ctx.stroke();

  // head
  ctx.beginPath();
  ctx.arc(0, -16, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd9b3';
  ctx.fill();

  // hair
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(0, -18, 8, Math.PI, 0);
  ctx.fill();

  // face
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-3, -17, 1.3, 0, Math.PI * 2);
  ctx.arc(3, -17, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -14, 3, 0, Math.PI);
  ctx.stroke();

  ctx.restore();
}

// PROFILE LOGIC

function initProfile() {
  const avatarCanvas = document.getElementById('avatarCanvas');
  if (!avatarCanvas) return;
  const ctxA = avatarCanvas.getContext('2d');

  function drawAvatar() {
    const bodyType = document.getElementById('bodyTypeSelect').value;
    const hairStyle = document.getElementById('hairStyleSelect').value;
    const shirtStyle = document.getElementById('shirtStyleSelect').value;
    const pantsStyle = document.getElementById('pantsStyleSelect').value;
    const eyeShape = document.getElementById('eyeShapeSelect').value;
    const mouthShape = document.getElementById('mouthShapeSelect').value;
    const primaryColor = document.getElementById('primaryColor').value;
    const secondaryColor = document.getElementById('secondaryColor').value;

    ctxA.clearRect(0, 0, avatarCanvas.width, avatarCanvas.height);

    ctxA.save();
    ctxA.translate(avatarCanvas.width / 2, avatarCanvas.height / 2 + 20);

    // torso circle
    let torsoRadius = 40;
    if (bodyType === 'wide') torsoRadius = 46;
    if (bodyType === 'tall') torsoRadius = 36;
    if (bodyType === 'compact') torsoRadius = 32;

    ctxA.fillStyle = primaryColor;
    ctxA.beginPath();
    ctxA.arc(0, 0, torsoRadius, 0, Math.PI * 2);
    ctxA.fill();

    // belt / mawashi
    ctxA.fillStyle = secondaryColor;
    ctxA.fillRect(-torsoRadius, 4, torsoRadius * 2, 10);

    // head
    ctxA.beginPath();
    ctxA.arc(0, -torsoRadius - 18, 18, 0, Math.PI * 2);
    ctxA.fillStyle = '#ffd9b3';
    ctxA.fill();

    // hair
    ctxA.fillStyle = '#2c1b10';
    if (hairStyle === 'topknot') {
      ctxA.beginPath();
      ctxA.arc(0, -torsoRadius - 22, 18, Math.PI, 0);
      ctxA.fill();
      ctxA.fillRect(-3, -torsoRadius - 40, 6, 12);
      ctxA.beginPath();
      ctxA.arc(0, -torsoRadius - 44, 5, 0, Math.PI * 2);
      ctxA.fill();
    } else if (hairStyle === 'short') {
      ctxA.beginPath();
      ctxA.arc(0, -torsoRadius - 22, 18, Math.PI, 0);
      ctxA.fill();
    } else if (hairStyle === 'long') {
      ctxA.beginPath();
      ctxA.arc(0, -torsoRadius - 20, 18, Math.PI, 0);
      ctxA.fill();
      ctxA.fillRect(-18, -torsoRadius - 20, 36, 18);
    }

    // eyes
    ctxA.fillStyle = '#000';
    if (eyeShape === 'round') {
      ctxA.beginPath();
      ctxA.arc(-6, -torsoRadius - 20, 2, 0, Math.PI * 2);
      ctxA.arc(6, -torsoRadius - 20, 2, 0, Math.PI * 2);
      ctxA.fill();
    } else if (eyeShape === 'narrow') {
      ctxA.fillRect(-9, -torsoRadius - 21, 6, 1.4);
      ctxA.fillRect(3, -torsoRadius - 21, 6, 1.4);
    } else if (eyeShape === 'sleepy') {
      ctxA.beginPath();
      ctxA.arc(-6, -torsoRadius - 19, 2, 0, Math.PI);
      ctxA.arc(6, -torsoRadius - 19, 2, 0, Math.PI);
      ctxA.stroke();
    } else if (eyeShape === 'sharp') {
      ctxA.beginPath();
      ctxA.moveTo(-9, -torsoRadius - 21);
      ctxA.lineTo(-3, -torsoRadius - 19);
      ctxA.moveTo(3, -torsoRadius - 19);
      ctxA.lineTo(9, -torsoRadius - 21);
      ctxA.stroke();
    }

    // mouth
    ctxA.strokeStyle = '#000';
    if (mouthShape === 'smile') {
      ctxA.beginPath();
      ctxA.arc(0, -torsoRadius - 14, 6, 0, Math.PI);
      ctxA.stroke();
    } else if (mouthShape === 'neutral') {
      ctxA.beginPath();
      ctxA.moveTo(-5, -torsoRadius - 14);
      ctxA.lineTo(5, -torsoRadius - 14);
      ctxA.stroke();
    } else if (mouthShape === 'frown') {
      ctxA.beginPath();
      ctxA.arc(0, -torsoRadius - 12, 6, Math.PI, 0);
      ctxA.stroke();
    } else if (mouthShape === 'grit') {
      ctxA.fillStyle = '#fff';
      ctxA.fillRect(-6, -torsoRadius - 16, 12, 5);
      ctxA.strokeRect(-6, -torsoRadius - 16, 12, 5);
    }

    // arms
    ctxA.fillStyle = '#ffd9b3';
    ctxA.fillRect(-torsoRadius - 10, -12, 10, 22);
    ctxA.fillRect(torsoRadius, -12, 10, 22);

    // legs
    ctxA.fillStyle = '#ffd9b3';
    ctxA.fillRect(-16, torsoRadius - 4, 10, 24);
    ctxA.fillRect(6, torsoRadius - 4, 10, 24);
    ctxA.fillRect(-16, torsoRadius + 20, 16, 4);
    ctxA.fillRect(6, torsoRadius + 20, 16, 4);

    ctxA.restore();
  }

  ['bodyTypeSelect', 'hairStyleSelect', 'shirtStyleSelect', 'pantsStyleSelect', 'eyeShapeSelect', 'mouthShapeSelect', 'primaryColor', 'secondaryColor'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', drawAvatar);
      el.addEventListener('input', drawAvatar);
    }
  });

  drawAvatar();

  // Skill points
  updateAvailablePoints();
  updateLevelFromXP();
}

function rotateAvatar() {
  const canvas = document.getElementById('avatarCanvas');
  if (!canvas) return;
  const ctxA = canvas.getContext('2d');
  const imgData = ctxA.getImageData(0, 0, canvas.width, canvas.height);
  const off = document.createElement('canvas');
  off.width = canvas.width;
  off.height = canvas.height;
  off.getContext('2d').putImageData(imgData, 0, 0);

  ctxA.clearRect(0, 0, canvas.width, canvas.height);
  ctxA.save();
  ctxA.translate(canvas.width / 2, canvas.height / 2);
  ctxA.rotate(Math.PI / 6);
  ctxA.drawImage(off, -canvas.width / 2, -canvas.height / 2);
  ctxA.restore();
}

// Skill points / XP / Level

function sumStats() {
  const stats = ['strength','agility','attack','defense','fatality','charisma','stamina','magiska'];
  let total = 0;
  stats.forEach(s => {
    const span = document.getElementById('stat-' + s);
    if (span) {
      total += parseInt(span.textContent || '0', 10);
    }
  });
  return total;
}

function updateAvailablePoints() {
  const availEl = document.getElementById('availablePoints');
  if (!availEl) return;
  const used = sumStats();
  const remaining = Math.max(0, 9 - used);
  availEl.textContent = remaining;
}

function changeStat(stat, delta) {
  const span = document.getElementById('stat-' + stat);
  const availEl = document.getElementById('availablePoints');
  if (!span || !availEl) return;
  const current = parseInt(span.textContent || '0', 10);
  let available = parseInt(availEl.textContent || '0', 10);

  if (delta > 0 && available <= 0) return;
  if (delta < 0 && current <= 0) return;

  span.textContent = current + delta;
  available = available - delta;
  availEl.textContent = available;

  const xp = (9 - available) * 100;
  const xpSpan = document.getElementById('currentXP');
  if (xpSpan) xpSpan.textContent = xp;

  updateLevelFromXP();
}

function updateLevelFromXP() {
  const xpSpan = document.getElementById('currentXP');
  const levelSpan = document.getElementById('currentLevel');
  const bar = document.getElementById('levelProgress');
  if (!xpSpan || !levelSpan || !bar) return;
  const xp = parseInt(xpSpan.textContent || '0', 10);

  // thresholds: 0->1:1000, 1->2:2000 more (3000 total), then 3000 (6000), 4000 (10000), 5000 (15000)
  const thresholds = [0,1000,3000,6000,10000,15000];
  let level = 0;
  for (let i=0;i<thresholds.length;i++){
    if (xp >= thresholds[i]) level = i;
  }
  const next = thresholds[Math.min(level+1, thresholds.length-1)];
  const prev = thresholds[level];
  let pct = 0;
  if (next > prev) pct = ((xp - prev) / (next - prev)) * 100;
  if (level === thresholds.length-1) pct = 100;

  levelSpan.textContent = level;
  bar.style.width = pct + '%';
}

// Profile tabs

function showProfileTab(id, btn) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// Settings
function openSettingsModal() {
  const overlay = document.getElementById('settingsOverlay');
  const modal = document.getElementById('settingsModal');
  if (!overlay || !modal) return;
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');

  // Load stored settings
  try {
    const stored = JSON.parse(localStorage.getItem('sumoSettings') || '{}');
    Object.entries(stored).forEach(([key, val]) => {
      const el = document.getElementById('setting' + key.charAt(0).toUpperCase() + key.slice(1));
      if (el) el.value = val;
    });
  } catch {}
}

function closeSettingsModal() {
  const overlay = document.getElementById('settingsOverlay');
  const modal = document.getElementById('settingsModal');
  if (overlay) overlay.classList.add('hidden');
  if (modal) modal.classList.add('hidden');
}

function applyTheme(theme) {
  const body = document.body;
  if (!body) return;
  if (theme === 'light') {
    body.classList.remove('theme-dark');
  } else {
    if (!body.classList.contains('theme-dark')) body.classList.add('theme-dark');
  }
}

function saveSettings() {
  const data = {
    theme: document.getElementById('settingTheme').value,
    notifications: document.getElementById('settingNotifications').value,
    visual: document.getElementById('settingVisual').value,
    audio: document.getElementById('settingAudio').value,
    controls: document.getElementById('settingControls').value,
    accessibility: document.getElementById('settingAccessibility').value,
    language: document.getElementById('settingLanguage').value,
    privacy: document.getElementById('settingPrivacy').value,
    security: document.getElementById('settingSecurity').value,
    account: document.getElementById('settingAccount').value
  };
  localStorage.setItem('sumoSettings', JSON.stringify(data));
  applyTheme(data.theme);
  localStorage.setItem('sumoControls', data.controls);
  closeSettingsModal();
}

// INIT

document.addEventListener('DOMContentLoaded', () => {
  // apply stored theme / controls
  try {
    const stored = JSON.parse(localStorage.getItem('sumoSettings') || '{}');
    if (stored.theme) applyTheme(stored.theme);
    if (stored.controls) localStorage.setItem('sumoControls', stored.controls);
  } catch {}

  // Odometers
  const onlineEl = document.getElementById('onlineOdometer');
  const visitorsEl = document.getElementById('visitorsOdometer');
  if (onlineEl && visitorsEl) {
    const online = Math.floor(50 + Math.random() * 150);
    const visitors = Math.floor(1000 + Math.random() * 5000);
    animateOdometer(onlineEl, 0, online, 800);
    animateOdometer(visitorsEl, 0, visitors, 1100);
  }

  // index page?
  if (document.getElementById('sumoCanvas')) {
    showSection('homeSection');
    showGamePanel('game');
    initGame();
  }

  // profile page?
  if (document.getElementById('avatarCanvas')) {
    initProfile();
  }

  // chatbot welcome in case opened programmatically
  const chatLangSel = document.getElementById('chatbotLanguage');
  if (chatLangSel) {
    currentChatLang = chatLangSel.value;
    ensureChatWelcome();
  }
});
