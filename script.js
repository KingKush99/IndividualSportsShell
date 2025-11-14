// ========== INITIAL SETUP ==========
window.addEventListener("DOMContentLoaded", () => {
  setupNavTabs();
  setupSubtabs();
  setupCornerUI();
  setupChatbot();
  setupMiniSlots();
  setupStats();

  const displayName = getDisplayName();
  const playerLabel = document.getElementById("playerNameLabel");
  if (playerLabel) playerLabel.textContent = displayName || "You";

  initSumoGame();
});

// ========== SIMPLE PROFILE NAME HOOKS ==========
function getDisplayName() {
  return localStorage.getItem("displayName") || "You";
}

function getUsername() {
  return localStorage.getItem("username") || "Player1";
}

// ========== TABS ==========
function setupNavTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      document
        .querySelectorAll(".tab-page")
        .forEach((p) => p.classList.remove("active"));
      document
        .querySelectorAll(".nav-tab")
        .forEach((t) => t.classList.remove("active"));
      document.getElementById(targetId).classList.add("active");
      btn.classList.add("active");
    });
  });
}

function setupSubtabs() {
  const subBtns = document.querySelectorAll(".subtab-btn");
  subBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-subtab");
      document
        .querySelectorAll(".subtab-content")
        .forEach((s) => s.classList.remove("active"));
      document
        .querySelectorAll(".subtab-btn")
        .forEach((b) => b.classList.remove("active"));
      document.getElementById(targetId).classList.add("active");
      btn.classList.add("active");
    });
  });
}

// ========== CORNER UI ==========
function setupCornerUI() {
  const profileButton = document.getElementById("profileButton");
  if (profileButton) {
    profileButton.addEventListener("click", () => {
      window.location.href = "profile.html";
    });
  }

  const menuButton = document.getElementById("menuButton");
  const menuDropdown = document.getElementById("menuDropdown");
  if (menuButton && menuDropdown) {
    menuButton.addEventListener("click", () => {
      menuDropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!menuButton.contains(e.target) && !menuDropdown.contains(e.target)) {
        menuDropdown.classList.add("hidden");
      }
    });
  }

  const chatbotButton = document.getElementById("chatbotButton");
  const chatbotPanel = document.getElementById("chatbotPanel");
  if (chatbotButton && chatbotPanel) {
    chatbotButton.addEventListener("click", () => {
      chatbotPanel.classList.toggle("hidden");
    });
  }

  const miniSlotsButton = document.getElementById("miniSlotsButton");
  const miniSlotsPanel = document.getElementById("miniSlotsPanel");
  if (miniSlotsButton && miniSlotsPanel) {
    miniSlotsButton.addEventListener("click", () => {
      miniSlotsPanel.classList.toggle("hidden");
    });
  }
}

// ========== CHATBOT (LOCAL DUMMY) ==========
function setupChatbot() {
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");
  const chatLog = document.getElementById("chatLog");
  if (!chatInput || !chatSend || !chatLog) return;

  function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = `chat-message ${who}`;
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function replyToUser(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes("control") || lower.includes("how")) {
      addMessage(
        "Use ← / → / ↑ / ↓ or W/A/S/D to walk and Space to charge. Push the opponent out of the ring!",
        "bot"
      );
    } else if (lower.includes("こんにちは") || lower.includes("konnichiwa")) {
      addMessage("こんにちは！元気ですか？ Ready to wrestle?", "bot");
    } else {
      addMessage("I’m a simple ringside coach. Ask me about controls or basics!", "bot");
    }
  }

  chatSend.addEventListener("click", () => {
    const txt = chatInput.value.trim();
    if (!txt) return;
    addMessage(txt, "user");
    chatInput.value = "";
    replyToUser(txt);
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      chatSend.click();
    }
  });
}

// ========== MINI-SLOTS ==========
function setupMiniSlots() {
  const spinButton = document.getElementById("slotsSpinButton");
  const msg = document.getElementById("slotsMessage");
  const s1 = document.getElementById("slot1");
  const s2 = document.getElementById("slot2");
  const s3 = document.getElementById("slot3");
  if (!spinButton || !msg || !s1 || !s2 || !s3) return;

  const symbols = ["🍙", "🥋", "🍶", "🍡", "🥢"];

  spinButton.addEventListener("click", () => {
    const a = randomChoice(symbols);
    const b = randomChoice(symbols);
    const c = randomChoice(symbols);
    s1.textContent = a;
    s2.textContent = b;
    s3.textContent = c;
    if (a === b && b === c) {
      msg.textContent = "JACKPOT! Triple match!";
    } else if (a === b || b === c || a === c) {
      msg.textContent = "Nice! Double match!";
    } else {
      msg.textContent = "No match – try again!";
    }
  });
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ========== STATS (LOCAL) ==========
function setupStats() {
  const statsList = document.getElementById("statsList");
  if (!statsList) return;

  const stats = JSON.parse(localStorage.getItem("sumoStats") || "{}");
  const bouts = stats.bouts || 0;
  const wins = stats.wins || 0;
  const losses = bouts - wins;
  const bestStreak = stats.bestStreak || 0;

  const items = [
    `Total bouts: ${bouts}`,
    `Wins: ${wins}`,
    `Losses: ${losses < 0 ? 0 : losses}`,
    `Best winning streak: ${bestStreak}`,
  ];

  statsList.innerHTML = "";
  items.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    statsList.appendChild(li);
  });
}

// ========== SUMO GAME ENGINE (CANVAS) ==========
let canvas, ctx, msgBar, hpPlayerEl, hpCpuEl;

const sumoState = {
  player: null,
  cpu: null,
  ref: null,
  crowd: [],
  pushEffect: { active: false, x: 0, y: 0, scale: 0 },
  keys: {},
  ringRadius: 170,
  boutOver: false,
  time: 0,
};

function initSumoGame() {
  canvas = document.getElementById("sumoCanvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  msgBar = document.getElementById("msgBar");
  hpPlayerEl = document.getElementById("hpPlayer");
  hpCpuEl = document.getElementById("hpCpu");

  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + 40;

  sumoState.player = {
    x: cx - 90,
    y: cy,
    vx: 0,
    vy: 0,
    facing: 1,
    stamina: 100,
    anim: "idle",
    phase: Math.random() * Math.PI * 2,
    pushCooldown: 0,
  };

  sumoState.cpu = {
    x: cx + 90,
    y: cy,
    vx: 0,
    vy: 0,
    facing: -1,
    stamina: 100,
    anim: "idle",
    phase: Math.random() * Math.PI * 2,
    aiTimer: 0.5,
    pushCooldown: 0,
  };

  sumoState.ref = {
    x: cx,
    y: cy - 30,
    phase: 0,
  };

  // Circular stands crowd
  sumoState.crowd = [];
  const ringR = sumoState.ringRadius;
  const innerStandR = ringR + 40;
  const outerStandR = ringR + 80;
  const fanCount = 48;
  for (let i = 0; i < fanCount; i++) {
    const angle = (i / fanCount) * Math.PI * 2;
    const r = innerStandR + Math.random() * (outerStandR - innerStandR);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * (r * 0.55); // squash vertically for perspective
    sumoState.crowd.push({
      x,
      yBase: y,
      amp: 4 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      shirtColor: randomChoice(["#e74c3c", "#3498db", "#9b59b6", "#1abc9c", "#f1c40f"]),
      pantColor: randomChoice(["#2c3e50", "#34495e", "#1f2a3a"]),
      height: 32 + Math.random() * 10,
    });
  }

  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    sumoState.keys[key] = true;
    if (e.code === "Space") e.preventDefault();
  });
  document.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    sumoState.keys[key] = false;
  });

  canvas.addEventListener("click", () => {
    if (sumoState.boutOver) resetBout();
  });

  resetBout();
  lastTime = 0;
  requestAnimationFrame(gameLoop);
}

function setGameMessage(text) {
  if (msgBar) msgBar.textContent = text;
}

function resetBout() {
  const { player, cpu } = sumoState;
  if (!player || !cpu || !canvas) return;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + 40;

  player.x = cx - 90;
  player.y = cy;
  cpu.x = cx + 90;
  cpu.y = cy;
  player.stamina = 100;
  cpu.stamina = 100;
  player.vx = cpu.vx = 0;
  player.vy = cpu.vy = 0;
  player.anim = cpu.anim = "idle";
  player.pushCooldown = cpu.pushCooldown = 0;
  sumoState.boutOver = false;
  setGameMessage("Move with ← → / ↑ ↓ or W/A/S/D, Space to charge. Push opponent out of the ring!");
}

// ========== GAME LOOP ==========
let lastTime = 0;

function gameLoop(timestamp) {
  if (!canvas) return;
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  sumoState.time += dt;

  updateGame(dt);
  drawGame();

  requestAnimationFrame(gameLoop);
}

function updateGame(dt) {
  if (!ctx) return;
  const { player, cpu } = sumoState;
  if (!player || !cpu) return;

  if (!sumoState.boutOver) {
    handlePlayerInput(player, dt);
    handleCpuAI(cpu, dt, player);
    handlePhysics(player, cpu, dt);
  }

  player.pushCooldown = Math.max(0, player.pushCooldown - dt);
  cpu.pushCooldown = Math.max(0, cpu.pushCooldown - dt);

  updateUI(player, cpu);
}

function handlePlayerInput(p, dt) {
  const speed = 180;
  let dx = 0;
  let dy = 0;

  if (sumoState.keys["arrowleft"] || sumoState.keys["a"]) dx -= 1;
  if (sumoState.keys["arrowright"] || sumoState.keys["d"]) dx += 1;
  if (sumoState.keys["arrowup"] || sumoState.keys["w"]) dy -= 1;
  if (sumoState.keys["arrowdown"] || sumoState.keys["s"]) dy += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    p.vx = dx * speed;
    p.vy = dy * speed;
    if (dx !== 0) p.facing = dx > 0 ? 1 : -1;
    if (p.anim === "idle") p.anim = "walk";
  } else {
    p.vx = 0;
    p.vy = 0;
    if (p.anim === "walk") p.anim = "idle";
  }

  if ((sumoState.keys[" "] || sumoState.keys["space"]) && p.pushCooldown <= 0) {
    p.anim = "charge";
    attemptClash(false);
    p.pushCooldown = 0.4;
  }
}

function handleCpuAI(c, dt, player) {
  c.aiTimer -= dt;
  const speed = 160;

  let targetX = player.x;
  let targetY = player.y;

  const dist = Math.hypot(targetX - c.x, targetY - c.y);

  if (dist > 150) {
    const dx = targetX - c.x;
    const dy = targetY - c.y;
    const len = Math.hypot(dx, dy) || 1;
    c.vx = (dx / len) * speed;
    c.vy = (dy / len) * speed;
  } else if (dist < 120) {
    const dx = c.x - targetX;
    const dy = c.y - targetY;
    const len = Math.hypot(dx, dy) || 1;
    c.vx = (dx / len) * speed * 0.3;
    c.vy = (dy / len) * speed * 0.3;
  } else {
    c.vx = 0;
    c.vy = 0;
  }

  if (c.vx !== 0) c.facing = c.vx > 0 ? 1 : -1;
  if (c.vx !== 0 || c.vy !== 0) {
    if (c.anim === "idle") c.anim = "walk";
  } else if (c.anim === "walk") {
    c.anim = "idle";
  }

  if (c.aiTimer <= 0 && c.pushCooldown <= 0) {
    if (dist < 220) {
      c.anim = "charge";
      attemptClash(true);
      c.pushCooldown = 0.5;
      c.aiTimer = 1.0 + Math.random() * 0.7;
    } else {
      c.aiTimer = 0.4 + Math.random() * 0.3;
    }
  }
}

function handlePhysics(p, c, dt) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + 40;
  const maxR = sumoState.ringRadius - 20;

  p.x += p.vx * dt;
  p.y += p.vy * dt;
  c.x += c.vx * dt;
  c.y += c.vy * dt;

  // clamp inside ring
  let pr = Math.hypot(p.x - cx, p.y - cy);
  if (pr > maxR) {
    const ratio = maxR / pr;
    p.x = cx + (p.x - cx) * ratio;
    p.y = cy + (p.y - cy) * ratio;
  }

  let cr = Math.hypot(c.x - cx, c.y - cy);
  if (cr > maxR) {
    const ratio = maxR / cr;
    c.x = cx + (c.x - cx) * ratio;
    c.y = cy + (c.y - cy) * ratio;
  }

  // check ring-out
  if (!sumoState.boutOver) {
    const pOff = Math.hypot(p.x - cx, p.y - cy);
    const cOff = Math.hypot(c.x - cx, c.y - cy);
    const margin = 10;
    if (p.stamina <= 0 || pOff > maxR + margin) {
      endBout("cpu");
    } else if (c.stamina <= 0 || cOff > maxR + margin) {
      endBout("player");
    }
  }

  if (sumoState.pushEffect.active) {
    sumoState.pushEffect.scale += dt * 2.2;
    if (sumoState.pushEffect.scale > 1.5) {
      sumoState.pushEffect.active = false;
    }
  }
}

function attemptClash(cpuInitiated) {
  const { player, cpu } = sumoState;
  if (sumoState.boutOver || !canvas) return;

  const dist = Math.hypot(player.x - cpu.x, player.y - cpu.y);
  if (dist > 190) return;

  sumoState.pushEffect.active = true;
  sumoState.pushEffect.x = (player.x + cpu.x) / 2;
  sumoState.pushEffect.y = (player.y + cpu.y) / 2;
  sumoState.pushEffect.scale = 0.3;

  const base = 15 + Math.random() * 20;
  const playerRoll = base + (cpuInitiated ? 0 : 10) + Math.random() * 20;
  const cpuRoll = base + (cpuInitiated ? 12 : 2) + Math.random() * 20;

  let winner;
  let diff;
  if (playerRoll > cpuRoll) {
    winner = "player";
    diff = playerRoll - cpuRoll;
  } else {
    winner = "cpu";
    diff = cpuRoll - playerRoll;
  }

  const push = diff * 1.4;
  const angle = Math.atan2(cpu.y - player.y, cpu.x - player.x);

  if (winner === "player") {
    cpu.x += Math.cos(angle) * push;
    cpu.y += Math.sin(angle) * push;
    cpu.stamina -= diff * 1.2;
    setGameMessage("You drive the opponent back!");
    player.anim = "push";
  } else {
    player.x -= Math.cos(angle) * push;
    player.y -= Math.sin(angle) * push;
    player.stamina -= diff * 1.2;
    setGameMessage("You are forced toward the edge!");
    cpu.anim = "push";
  }
}

function endBout(winner) {
  sumoState.boutOver = true;
  const stats = JSON.parse(localStorage.getItem("sumoStats") || "{}");
  stats.bouts = (stats.bouts || 0) + 1;
  if (winner === "player") {
    stats.wins = (stats.wins || 0) + 1;
    stats.currentStreak = (stats.currentStreak || 0) + 1;
    stats.bestStreak = Math.max(stats.bestStreak || 0, stats.currentStreak || 0);
    setGameMessage("You win! Click the ring to start a new bout.");
  } else {
    stats.currentStreak = 0;
    setGameMessage("CPU wins. Click the ring to try again.");
  }
  localStorage.setItem("sumoStats", JSON.stringify(stats));
  setupStats();
  updateGameLeaderboard();
}

// ========== DRAWING ==========
function drawGame() {
  if (!ctx) return;
  const { player, cpu } = sumoState;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawStands();
  drawCrowd();
  drawDohyo();
  drawReferee();
  drawFighter(player, "#e74c3c", true);
  drawFighter(cpu, "#3498db", false);
  drawPushCircle();
}

function drawStands() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + 40;
  const rOuter = sumoState.ringRadius + 90;
  const rMid = sumoState.ringRadius + 60;

  const grd = ctx.createRadialGradient(cx, cy - 60, 40, cx, cy - 40, rOuter);
  grd.addColorStop(0, "#1f2536");
  grd.addColorStop(1, "#05060b");
  ctx.fillStyle = grd;

  ctx.beginPath();
  ctx.ellipse(cx, cy - 20, rOuter, rOuter * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#20263a";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, rMid, rMid * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCrowd() {
  const t = sumoState.time;
  const crowd = sumoState.crowd;
  for (const f of crowd) {
    const y = f.yBase + Math.sin(t * 2 + f.phase) * f.amp;
    const h = f.height;
    const x = f.x;

    const torsoHeight = h * 0.45;
    const legHeight = h * 0.35;
    const headRadius = h * 0.2;
    const torsoTop = y - torsoHeight;
    const headCenterY = torsoTop - headRadius - 2;

    // legs
    ctx.fillStyle = f.pantColor;
    const legWidth = 6;
    ctx.fillRect(x - legWidth - 3, y - legHeight, legWidth, legHeight);
    ctx.fillRect(x + 3, y - legHeight, legWidth, legHeight);

    // feet
    ctx.fillStyle = "#111";
    ctx.fillRect(x - legWidth - 4, y - 4, legWidth + 2, 4);
    ctx.fillRect(x + 2, y - 4, legWidth + 2, 4);

    // torso
    ctx.fillStyle = f.shirtColor;
    ctx.fillRect(x - 9, torsoTop, 18, torsoHeight);

    // arms
    ctx.fillStyle = "#f3d5b5";
    ctx.fillRect(x - 15, torsoTop + 4, 6, torsoHeight - 6);
    ctx.fillRect(x + 9, torsoTop + 4, 6, torsoHeight - 6);

    // hands
    ctx.beginPath();
    ctx.arc(x - 12, torsoTop + torsoHeight, 3, 0, Math.PI * 2);
    ctx.arc(x + 12, torsoTop + torsoHeight, 3, 0, Math.PI * 2);
    ctx.fill();

    // head
    ctx.fillStyle = "#f3d5b5";
    ctx.beginPath();
    ctx.arc(x, headCenterY, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // hair
    ctx.fillStyle = "#2c2b30";
    ctx.beginPath();
    ctx.arc(x, headCenterY - headRadius * 0.3, headRadius, Math.PI, 0);
    ctx.fill();

    // ears
    ctx.beginPath();
    ctx.arc(x - headRadius, headCenterY, headRadius * 0.35, 0, Math.PI * 2);
    ctx.arc(x + headRadius, headCenterY, headRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // face
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x - headRadius * 0.4, headCenterY - 2, 1.4, 0, Math.PI * 2);
    ctx.arc(x + headRadius * 0.4, headCenterY - 2, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#b03030";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, headCenterY + 2, headRadius * 0.5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
}

function drawDohyo() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + 40;
  const rOuter = sumoState.ringRadius + 20;
  const rInner = sumoState.ringRadius;

  const grd = ctx.createRadialGradient(cx, cy, 20, cx, cy, rOuter);
  grd.addColorStop(0, "#cfa36a");
  grd.addColorStop(1, "#7f5b2f");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#f8e0b0";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#f8e8d0";
  ctx.fillRect(cx - 60, cy - 4, 40, 8);
  ctx.fillRect(cx + 20, cy - 4, 40, 8);
}

function drawReferee() {
  const ref = sumoState.ref;
  const t = sumoState.time;
  const bob = Math.sin(t * 3) * 2;

  const x = ref.x;
  const y = ref.y + bob;

  // legs
  ctx.fillStyle = "#2c3e50";
  ctx.fillRect(x - 7, y + 30, 6, 20);
  ctx.fillRect(x + 1, y + 30, 6, 20);

  ctx.fillStyle = "#111";
  ctx.fillRect(x - 8, y + 48, 8, 4);
  ctx.fillRect(x + 1, y + 48, 8, 4);

  // torso (kimono)
  ctx.fillStyle = "#b83232";
  ctx.fillRect(x - 12, y, 24, 34);

  // arms
  ctx.fillStyle = "#f1d2aa";
  ctx.fillRect(x - 18, y + 4, 6, 22);
  ctx.fillRect(x + 12, y + 4, 6, 22);

  // hands
  ctx.beginPath();
  ctx.arc(x - 15, y + 26, 3, 0, Math.PI * 2);
  ctx.arc(x + 15, y + 26, 3, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.fillStyle = "#f1d2aa";
  ctx.beginPath();
  ctx.arc(x, y - 18, 12, 0, Math.PI * 2);
  ctx.fill();

  // ears
  ctx.beginPath();
  ctx.arc(x - 12, y - 18, 3, 0, Math.PI * 2);
  ctx.arc(x + 12, y - 18, 3, 0, Math.PI * 2);
  ctx.fill();

  // hair hat
  ctx.fillStyle = "#11131a";
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 26);
  ctx.lineTo(x + 14, y - 26);
  ctx.lineTo(x, y - 44);
  ctx.closePath();
  ctx.fill();

  // face
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x - 4, y - 20, 2, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 20, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#a03030";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y - 14, 5, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // waving flag arm
  ctx.strokeStyle = "#f1d2aa";
  ctx.lineWidth = 3;
  ctx.beginPath();
  const armAngle = Math.sin(t * 4) * 0.7;
  const ax1 = x + 15;
  const ay1 = y + 12;
  const armLen = 22;
  const ax2 = ax1 + armLen * Math.cos(armAngle);
  const ay2 = ay1 + armLen * Math.sin(armAngle);
  ctx.moveTo(ax1, ay1);
  ctx.lineTo(ax2, ay2);
  ctx.stroke();

  // little flag
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(ax2, ay2);
  ctx.lineTo(ax2 + 8, ay2 - 4);
  ctx.lineTo(ax2 + 8, ay2 + 4);
  ctx.closePath();
  ctx.fill();
}

function drawFighter(f, beltColor, isPlayer) {
  const t = sumoState.time;
  const cx = f.x;
  const cy = f.y;
  const wobble = Math.sin(t * 4 + f.phase) * 3;

  const facing = f.facing || 1;
  ctx.save();
  ctx.translate(cx, cy + wobble);
  if (facing < 0) ctx.scale(-1, 1);

  // Scale for full body
  const bodyWidth = 36;
  const bodyHeight = 42;
  const legHeight = 24;
  const headRadius = 18;

  // legs
  ctx.fillStyle = "#f3d0a0";
  ctx.fillRect(-bodyWidth * 0.4, 20, 10, legHeight);
  ctx.fillRect(bodyWidth * 0.1, 20, 10, legHeight);

  // feet
  ctx.fillStyle = "#111";
  ctx.fillRect(-bodyWidth * 0.42, 20 + legHeight, 14, 5);
  ctx.fillRect(bodyWidth * 0.08, 20 + legHeight, 14, 5);

  // torso
  ctx.fillStyle = "#f3d0a0";
  ctx.beginPath();
  ctx.moveTo(-bodyWidth * 0.5, -4);
  ctx.lineTo(bodyWidth * 0.5, -4);
  ctx.quadraticCurveTo(bodyWidth * 0.7, 20, bodyWidth * 0.4, 32);
  ctx.lineTo(-bodyWidth * 0.4, 32);
  ctx.quadraticCurveTo(-bodyWidth * 0.7, 20, -bodyWidth * 0.5, -4);
  ctx.closePath();
  ctx.fill();

  // belt / mawashi
  ctx.fillStyle = beltColor;
  ctx.fillRect(-bodyWidth * 0.6, 10, bodyWidth * 1.2, 14);

  // arms
  ctx.fillStyle = "#f3d0a0";
  let armRaise = 0;
  if (f.anim === "charge" || f.anim === "push") {
    armRaise = -10;
  } else if (f.anim === "walk") {
    armRaise = Math.sin(t * 8 + f.phase) * 6;
  }

  ctx.fillRect(-bodyWidth * 0.8, 0 + armRaise, 10, 24);
  ctx.fillRect(bodyWidth * 0.7, 0 + armRaise, 10, 24);

  // hands
  ctx.beginPath();
  ctx.arc(-bodyWidth * 0.75 + 5, 24 + armRaise, 5, 0, Math.PI * 2);
  ctx.arc(bodyWidth * 0.75 + 5, 24 + armRaise, 5, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.fillStyle = "#f3d0a0";
  ctx.beginPath();
  ctx.arc(0, -20, headRadius, 0, Math.PI * 2);
  ctx.fill();

  // ears
  ctx.beginPath();
  ctx.arc(-headRadius, -20, 4, 0, Math.PI * 2);
  ctx.arc(headRadius, -20, 4, 0, Math.PI * 2);
  ctx.fill();

  // top knot hair
  ctx.fillStyle = "#1b1411";
  ctx.beginPath();
  ctx.arc(0, -32, 10, 0, Math.PI * 2);
  ctx.fill();

  // face
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(-6, -22, 2.2, 0, Math.PI * 2);
  ctx.arc(6, -22, 2.2, 0, Math.PI * 2);
  ctx.fill();

  const tired = f.stamina < 35;
  ctx.strokeStyle = "#a03030";
  ctx.lineWidth = tired ? 3 : 2;
  ctx.beginPath();
  if (isPlayer) {
    ctx.arc(0, -16, tired ? 6 : 8, 0.1 * Math.PI, 0.9 * Math.PI);
  } else {
    ctx.arc(0, -16, tired ? 6 : 8, 1.1 * Math.PI, 1.9 * Math.PI);
  }
  ctx.stroke();

  ctx.restore();
}

function drawPushCircle() {
  if (!sumoState.pushEffect.active) return;
  const { x, y, scale } = sumoState.pushEffect;
  ctx.save();
  const radius = 40 * scale;
  ctx.globalAlpha = 0.7 * (1.5 - scale);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function updateUI(player, cpu) {
  if (!hpPlayerEl || !hpCpuEl) return;
  hpPlayerEl.style.width = Math.max(0, player.stamina) + "%";
  hpCpuEl.style.width = Math.max(0, cpu.stamina) + "%";
}

// ========== GAME LEADERBOARD (LOCAL) ==========
function updateGameLeaderboard() {
  const tbody = document.getElementById("gameLeaderboardBody");
  if (!tbody) return;

  const stats = JSON.parse(localStorage.getItem("sumoStats") || "{}");
  const displayName = getDisplayName();
  const bouts = stats.bouts || 0;
  const wins = stats.wins || 0;

  const rows = [
    {
      rank: 1,
      name: displayName,
      wins,
      bouts,
    },
  ];

  tbody.innerHTML = "";
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.rank}</td>
      <td>${r.name}</td>
      <td>${r.wins}</td>
      <td>${r.bouts}</td>
    `;
    tbody.appendChild(tr);
  });
}
