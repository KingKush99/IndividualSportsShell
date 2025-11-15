// --- language dictionary ---
const GLOBAL_TRANSLATIONS = {
  en: {
    siteTitle: "Sumo Showdown Hub",
    profileTitle: "Profile & Fighters",
    tabGame: "Game",
    tabGameLeaderboard: "Game Leaderboard",
    gameLeaderboardHeading: "Top Wrestlers",
    username: "Username",
    wins: "Wins",
    onlineNow: "ONLINE NOW",
    allTimeVisitors: "ALL TIME VISITORS",
    footerAccessibility: "ACCESSIBILITY",
    footerCompany: "COMPANY",
    footerCompetitions: "COMPETITIONS",
    footerLegal: "LEGAL",
    footerSupport: "SUPPORT",
    footerSocial: "SOCIAL MEDIA",
    chatbotTitle: "Sumo Assistant",
    assistantLanguage: "Assistant language",
    chatPlaceholder: "Ask about sumo...",
    send: "Send",
    miniSlotsTitle: "Sumo Reel Mini-Slots",
    reels: "Reels:",
    customizeHeader: "Character Customization",
    nameLabel: "Username (changes 1× per week)",
    displayNameLabel: "Display Name",
    displayNameNote: "Display name appears in game and profile, username appears on leaderboards.",
    appearanceHeader: "Appearance",
    bodyType: "Body Type",
    hairStyle: "Hair Style",
    shirtStyle: "Shirt Style",
    pantsStyle: "Pants Style",
    eyeShape: "Eye Shape",
    mouthShape: "Mouth Shape",
    colorsHeader: "Colors",
    skinColor: "Skin",
    hairColor: "Hair",
    mawashiColor: "Mawashi",
    skillPointsHeader: "Skill Points",
    availablePoints: "Available:",
    subTabStats: "Stats",
    subTabItems: "Items",
    subTabCampaign: "Campaign",
    subTabCheckout: "Checkout",
    progressHeader: "Progress",
    currentLevel: "Level",
    itemsBody: "Your mawashi, banners and entrance effects will appear here.",
    campaignBody: "Progress through arenas and stadiums is tracked here.",
    checkoutBody: "Tokens and cosmetic purchases summary.",
    settingsTitle: "Settings",
    settingTheme: "Theme",
    settingNotifications: "Notifications",
    settingVisual: "Visual settings",
    settingAudio: "Audio settings",
    settingControls: "Controls",
    settingAccessibility: "Accessibility",
    settingLanguage: "Language",
    settingPrivacy: "Privacy",
    settingSecurity: "Security",
    settingAccount: "Account",
    accessibilityBody: "Accessibility options and suggestions.",
    companyBody: "About the Sumo Showdown company.",
    competitionsBody: "Tournaments, prizes and awards.",
    legalBody: "Terms, privacy, cookies and community rules.",
    supportBody: "Contact, help center, FAQs and bug reports.",
    socialBody: "Links to social channels.",
    buyFiat: "Buy with fiat",
    buyCrypto: "Buy with crypto",
    watchAds: "Watch ads",
    turnCoins: "Turn coins"
  },
  fr: {
    siteTitle: "Centre Sumo Showdown",
    profileTitle: "Profil et Combattants",
    tabGame: "Jeu",
    tabGameLeaderboard: "Classement du jeu",
    gameLeaderboardHeading: "Meilleurs lutteurs",
    username: "Identifiant",
    wins: "Victoires",
    onlineNow: "EN LIGNE",
    allTimeVisitors: "VISITES TOTALES",
    footerAccessibility: "ACCESSIBILITÉ",
    footerCompany: "ENTREPRISE",
    footerCompetitions: "COMPÉTITIONS",
    footerLegal: "JURIDIQUE",
    footerSupport: "SUPPORT",
    footerSocial: "RÉSEAUX SOCIAUX"
  }
};

const LANGUAGE_STORAGE_KEY = "sumoGlobalLang";

function applyGlobalLanguage(langCode) {
  const dict = GLOBAL_TRANSLATIONS[langCode] || GLOBAL_TRANSLATIONS.en;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.setAttribute("placeholder", dict[key]);
  });
  localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
}

function initLanguage() {
  const select = document.getElementById("globalLanguageSelect");
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
  if (select) {
    select.value = saved;
    select.addEventListener("change", () => applyGlobalLanguage(select.value));
  }
  applyGlobalLanguage(saved);
}

// hamburger
function toggleHamburgerMenu() {
  const menu = document.getElementById("hamburgerMenu");
  if (menu) menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// footer counters
function initVisitorCounters() {
  const online = 66;
  const allTime = 1509381;
  fillDigitRow("onlineDigits", online);
  fillDigitRow("allTimeDigits", allTime);
}

function fillDigitRow(id, number) {
  const container = document.getElementById(id);
  if (!container) return;
  container.innerHTML = "";
  const str = number.toString().padStart(6,"0");
  for (const ch of str) {
    const box = document.createElement("div");
    box.className = "digit-box";
    box.textContent = ch;
    container.appendChild(box);
  }
}

function openFooterModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}
function closeFooterModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
}

// chatbot
function openChatbotModal() {
  const modal = document.getElementById("chatbotModal");
  if (modal) modal.classList.add("active");
}
function closeChatbotModal() {
  const modal = document.getElementById("chatbotModal");
  if (modal) modal.classList.remove("active");
}
function sendFakeChat() {
  const input = document.getElementById("chatInput");
  const log = document.getElementById("chatLog");
  if (!input || !log || !input.value.trim()) return;
  const pUser = document.createElement("p");
  pUser.textContent = "You: " + input.value;
  const pBot = document.createElement("p");
  pBot.textContent = "Assistant: Imagine a detailed answer about sumo here.";
  log.appendChild(pUser);
  log.appendChild(pBot);
  log.scrollTop = log.scrollHeight;
  input.value = "";
}

// mini-slots
let currentBet = 10;
let currentReelCount = 3;

function showMiniSlots() {
  const modal = document.getElementById("miniSlotsModal");
  if (modal) modal.classList.add("active");
  buildReels();
}
function hideMiniSlots() {
  const modal = document.getElementById("miniSlotsModal");
  if (modal) modal.classList.remove("active");
}
function setBet(amount) { currentBet = amount; }

function buildReels() {
  const select = document.getElementById("reelCountSelect");
  const container = document.getElementById("reelsContainer");
  if (!select || !container) return;
  const count = parseInt(select.value, 10);
  currentReelCount = count;
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const div = document.createElement("div");
    div.className = "reel";
    div.textContent = "—";
    container.appendChild(div);
  }
}

function spinReels() {
  const container = document.getElementById("reelsContainer");
  if (!container) return;
  const reels = Array.from(container.querySelectorAll(".reel"));
  const symbols = ["🍱","🥟","🥢","💥","🌀","🎌"];
  reels.forEach((reel, index) => {
    setTimeout(() => {
      let steps = 12;
      const interval = setInterval(() => {
        reel.textContent = symbols[Math.floor(Math.random()*symbols.length)];
        steps--;
        if (steps <= 0) clearInterval(interval);
      }, 40);
    }, index * 110);
  });
}

function pullLever() { spinReels(); }

// sumo game
let canvas, ctx;
let lastTime = 0;

const ringRadius = 180;
const sandRadius = 220;
const grabDistance = 50;
const throwImpulse = 8;

const players = [
  {
    id: 1,
    username: localStorage.getItem("sumoProfileUsername") || "Player1",
    x: -60, y: 0, vx: 0, vy: 0, facing: 1,
    grabbed: null, isGrabbing: false
  },
  {
    id: 2,
    username: "CPU",
    x: 60, y: 0, vx: 0, vy: 0, facing: -1,
    grabbed: null, isGrabbing: false
  }
];

const referee = { x: 0, y: -40, phase: 0 };
const crowdSeats = [];
for (let i = 0; i < 40; i++) {
  const angle = (i / 40) * Math.PI * 2;
  crowdSeats.push({
    x: Math.cos(angle) * 260,
    y: Math.sin(angle) * 260,
    color: i % 3 === 0 ? "#ffd39b" : "#f2c27a"
  });
}

const keys = {};
window.addEventListener("keydown", e => { keys[e.key] = true; });
window.addEventListener("keyup", e => { keys[e.key] = false; });

function initHomeIfPresent() {
  canvas = document.getElementById("sumoCanvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  requestAnimationFrame(gameLoop);
  buildGameLeaderboard();
}

function gameLoop(timestamp) {
  if (!canvas) return;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  updateSumo(dt);
  drawGame();
  requestAnimationFrame(gameLoop);
}

function updateSumo(dt) {
  const p1 = players[0];
  const p2 = players[1];
  const speed = 150;

  p1.vx = 0; p1.vy = 0;
  if (keys["a"]) p1.vx -= speed;
  if (keys["d"]) p1.vx += speed;
  if (keys["w"]) p1.vy -= speed;
  if (keys["s"]) p1.vy += speed;
  if (p1.vx !== 0) p1.facing = Math.sign(p1.vx);

  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dist = Math.hypot(dx, dy);
  p2.vx = (dx / (dist || 1)) * speed * 0.6;
  p2.vy = (dy / (dist || 1)) * speed * 0.6;
  if (p2.vx !== 0) p2.facing = Math.sign(p2.vx);

  const closeEnough = dist < grabDistance;
  if (keys[" "] && closeEnough && !p1.grabbed && !p2.grabbed) {
    p1.grabbed = p2;
    p2.grabbed = p1;
    p1.isGrabbing = true;
  }
  if (!keys[" "] && p1.isGrabbing && p1.grabbed) {
    const target = p1.grabbed;
    const throwDirX = p1.facing;
    const throwDirY = (Math.random() - 0.5) * 0.8;
    target.vx += throwDirX * throwImpulse * 60;
    target.vy += throwDirY * throwImpulse * 60;
    p1.grabbed = null;
    target.grabbed = null;
    p1.isGrabbing = false;
  }

  players.forEach(p => {
    if (p.grabbed) {
      const other = p.grabbed;
      other.x = p.x + p.facing * 25;
      other.y = p.y;
    }
  });

  players.forEach(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const r = Math.hypot(p.x, p.y);
    if (r > ringRadius) {
      const scale = ringRadius / r;
      p.x *= scale;
      p.y *= scale;
    }
  });

  referee.phase += dt * 0.6;
  referee.x = Math.cos(referee.phase) * 20;
  referee.y = -40 + Math.sin(referee.phase) * 8;
}

function drawCrowd(ctx) {
  crowdSeats.forEach(seat => {
    ctx.save();
    ctx.translate(seat.x, seat.y);
    ctx.fillStyle = "#4b4b4b";
    ctx.fillRect(-7, 6, 14, 6);
    ctx.fillStyle = seat.color;
    ctx.fillRect(-5, -4, 10, 16);
    ctx.beginPath();
    ctx.arc(0, -10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-4, 10, 3, 6);
    ctx.fillRect(1, 10, 3, 6);
    ctx.restore();
  });
}

function drawReferee(ctx) {
  ctx.save();
  ctx.translate(referee.x, referee.y);
  ctx.fillStyle = "#f3d0a0";
  ctx.fillRect(-6, 14, 8, 22);
  ctx.fillRect(0, 14, 8, 22);
  ctx.fillStyle = "#e67e22";
  ctx.beginPath();
  ctx.rect(-14, -4, 28, 30);
  ctx.fill();
  ctx.fillStyle = "#f3d0a0";
  ctx.beginPath();
  ctx.arc(0, -14, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(-9, -22, 18, 8);
  ctx.restore();
}

function drawFighter(ctx, p, isPlayer1) {
  ctx.save();
  ctx.translate(p.x, p.y);

  ctx.fillStyle = "#f3d0a0";
  ctx.beginPath();
  ctx.rect(-10, 20, 12, 30);
  ctx.rect(-2, 20, 12, 30);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(-12, 48, 16, 6);
  ctx.fillRect(-2, 48, 16, 6);

  ctx.fillStyle = "#f3d0a0";
  ctx.rect(-18, -10, 36, 34);
  ctx.fill();

  ctx.fillStyle = "#c98a7a";
  ctx.beginPath();
  ctx.arc(-8, 2, 2, 0, Math.PI * 2);
  ctx.arc(8, 2, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isPlayer1 ? "#e74c3c" : "#3498db";
  ctx.fillRect(-18, 16, 36, 12);

  ctx.fillStyle = "#f3d0a0";
  ctx.beginPath();
  ctx.rect(-28, -8, 10, 26);
  ctx.rect(18, -8, 10, 26);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, -22, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2c1b12";
  ctx.beginPath();
  ctx.arc(0, -26, 14, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(-5, -24, 2, 0, Math.PI * 2);
  ctx.arc(5, -24, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-6, -18);
  ctx.quadraticCurveTo(0, -16, 6, -18);
  ctx.strokeStyle = "#a03030";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawGame() {
  if (!ctx) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);

  ctx.fillStyle = "#cfa46a";
  ctx.beginPath();
  ctx.arc(0, 0, sandRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f1d9a3";
  ctx.beginPath();
  ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#b88646";
  ctx.lineWidth = 6;
  ctx.stroke();

  drawCrowd(ctx);
  drawReferee(ctx);
  drawFighter(ctx, players[0], true);
  drawFighter(ctx, players[1], false);

  ctx.restore();
}

function showHomeTab(name) {
  const gameSec = document.getElementById("gameSection");
  const lbSec = document.getElementById("leaderboardSection");
  const t1 = document.getElementById("tabGame");
  const t2 = document.getElementById("tabLeaderboard");
  if (!gameSec || !lbSec || !t1 || !t2) return;
  if (name === "game") {
    gameSec.classList.add("active");
    lbSec.classList.remove("active");
    t1.classList.add("active");
    t2.classList.remove("active");
  } else {
    lbSec.classList.add("active");
    gameSec.classList.remove("active");
    t2.classList.add("active");
    t1.classList.remove("active");
  }
}

// leaderboard uses username
function buildGameLeaderboard() {
  const tbody = document.querySelector("#gameLeaderboardTable tbody");
  if (!tbody) return;
  const username = localStorage.getItem("sumoProfileUsername") || "Player1";
  const data = [
    { username, wins: 32 },
    { username: "SumoPro99", wins: 28 },
    { username: "RingTiger", wins: 25 }
  ];
  tbody.innerHTML = "";
  data.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td>${row.username}</td><td>${row.wins}</td>`;
    tbody.appendChild(tr);
  });
}

// profile
const XP_THRESHOLDS = [1000,3000,6000,10000,15000];

function initProfileIfPresent() {
  const canvas = document.getElementById("profileCanvas");
  if (!canvas) return;

  const usernameInput = document.getElementById("usernameInput");
  const displayInput = document.getElementById("displayNameInput");

  const storedUser = localStorage.getItem("sumoProfileUsername") || "";
  const storedDisplay = localStorage.getItem("sumoDisplayName") || "";
  if (usernameInput) usernameInput.value = storedUser;
  if (displayInput) displayInput.value = storedDisplay;

  if (usernameInput) {
    usernameInput.addEventListener("change", () => {
      const lastChange = parseInt(localStorage.getItem("sumoUsernameLastChange") || "0", 10);
      const now = Date.now();
      const weekMs = 7*24*60*60*1000;
      if (now - lastChange < weekMs) {
        alert("Username can only be changed once per week.");
        usernameInput.value = storedUser;
      } else {
        const val = usernameInput.value.trim().slice(0,64);
        localStorage.setItem("sumoProfileUsername", val);
        localStorage.setItem("sumoUsernameLastChange", String(now));
      }
    });
  }

  if (displayInput) {
    displayInput.addEventListener("input", () => {
      const val = displayInput.value.trim().slice(0,64);
      localStorage.setItem("sumoDisplayName", val);
    });
  }

  const stats = ["strength","agility","attack","defence","vitality","charisma","stamina","magicka"];
  const baseValue = 1;
  const statControls = document.getElementById("statControls");
  const remainingSpan = document.getElementById("skillPointsRemaining");
  const statState = {};
  stats.forEach(name => statState[name] = baseValue);
  let remaining = 9;
  stats.forEach(name => {
    const row = document.createElement("div");
    row.className = "stat-row";
    const label = document.createElement("span");
    label.textContent = name;
    const valueSpan = document.createElement("span");
    valueSpan.textContent = String(statState[name]);
    const btns = document.createElement("span");
    const minus = document.createElement("button");
    minus.textContent = "−";
    const plus = document.createElement("button");
    plus.textContent = "+";
    minus.addEventListener("click", () => {
      if (statState[name] > baseValue) {
        statState[name]--;
        remaining++;
        valueSpan.textContent = statState[name];
        remainingSpan.textContent = remaining;
      }
    });
    plus.addEventListener("click", () => {
      if (remaining > 0) {
        statState[name]++;
        remaining--;
        valueSpan.textContent = statState[name];
        remainingSpan.textContent = remaining;
      }
    });
    btns.appendChild(minus);
    btns.appendChild(plus);
    row.appendChild(label);
    row.appendChild(valueSpan);
    row.appendChild(btns);
    statControls.appendChild(row);
  });

  ["bodyTypeSelect","hairStyleSelect","shirtStyleSelect","pantsStyleSelect",
   "eyeShapeSelect","mouthShapeSelect",
   "skinColorPicker","hairColorPicker","mawashiColorPicker"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const key = "sumo_" + id;
    const stored = localStorage.getItem(key);
    if (stored) el.value = stored;
    const update = () => {
      localStorage.setItem(key, el.value);
      drawProfileCharacter();
    };
    el.addEventListener("change", update);
    el.addEventListener("input", update);
  });

  drawProfileCharacter();
  updateLevelFromXP();
}

function drawProfileCharacter() {
  const canvas = document.getElementById("profileCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const skin = document.getElementById("skinColorPicker")?.value || "#f3d0a0";
  const hair = document.getElementById("hairColorPicker")?.value || "#2c1b12";
  const mawashi = document.getElementById("mawashiColorPicker")?.value || "#e74c3c";

  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);

  ctx.fillStyle = skin;
  ctx.fillRect(-10, 20, 12, 30);
  ctx.fillRect(-2, 20, 12, 30);
  ctx.fillStyle = "#111";
  ctx.fillRect(-12, 48, 16, 6);
  ctx.fillRect(-2, 48, 16, 6);

  ctx.fillStyle = skin;
  ctx.fillRect(-18, -10, 36, 34);

  ctx.fillStyle = "#c98a7a";
  ctx.beginPath();
  ctx.arc(-8, 2, 2, 0, Math.PI * 2);
  ctx.arc(8, 2, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = mawashi;
  ctx.fillRect(-18, 16, 36, 12);

  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.rect(-28, -8, 10, 26);
  ctx.rect(18, -8, 10, 26);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, -22, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(0, -26, 14, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(-5, -24, 2, 0, Math.PI * 2);
  ctx.arc(5, -24, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-6, -18);
  ctx.quadraticCurveTo(0, -16, 6, -18);
  ctx.strokeStyle = "#a03030";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function showProfileSubTab(which) {
  const panels = {
    stats: document.getElementById("profileStatsPanel"),
    items: document.getElementById("profileItemsPanel"),
    campaign: document.getElementById("profileCampaignPanel"),
    checkout: document.getElementById("profileCheckoutPanel")
  };
  const tabs = {
    stats: document.getElementById("profileStatsTab"),
    items: document.getElementById("profileItemsTab"),
    campaign: document.getElementById("profileCampaignTab"),
    checkout: document.getElementById("profileCheckoutTab")
  };
  Object.keys(panels).forEach(key => {
    if (!panels[key] || !tabs[key]) return;
    if (key === which) {
      panels[key].classList.add("active");
      tabs[key].classList.add("active");
    } else {
      panels[key].classList.remove("active");
      tabs[key].classList.remove("active");
    }
  });
}

function updateLevelFromXP() {
  const xp = parseInt(localStorage.getItem("sumoXP") || "0", 10);
  const xpSpan = document.getElementById("currentXP");
  const lvlSpan = document.getElementById("currentLevel");
  const bar = document.getElementById("levelBarFill");
  if (!xpSpan || !lvlSpan || !bar) return;
  xpSpan.textContent = xp;
  let level = 1;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) level = i + 1;
  }
  lvlSpan.textContent = level;
  const maxXP = XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const percent = Math.max(0, Math.min(100, (xp / maxXP) * 100));
  bar.style.width = percent + "%";
}

function openSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) modal.classList.add("active");
}
function closeSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) modal.classList.remove("active");
}

// DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("pushSpinBtn");
  if (btn) btn.addEventListener("click", spinReels);
  const select = document.getElementById("reelCountSelect");
  if (select) select.addEventListener("change", buildReels);
  initLanguage();
  initVisitorCounters();
  initHomeIfPresent();
  initProfileIfPresent();
});
