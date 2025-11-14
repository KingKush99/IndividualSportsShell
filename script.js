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
// Assumes your profile.html will set these localStorage keys.
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
  // Profile button -> go to profile page
  const profileButton = document.getElementById("profileButton");
  if (profileButton) {
    profileButton.addEventListener("click", () => {
      // Replace with your exact profile path if needed
      window.location.href = "profile.html";
    });
  }

  // Hamburger menu
  const menuButton = document.getElementById("menuButton");
  const menuDropdown = document.getElementById("menuDropdown");
  if (menuButton && menuDropdown) {
    menuButton.addEventListener("click", () => {
      menuDropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (
        !menuButton.contains(e.target) &&
        !menuDropdown.contains(e.target)
      ) {
        menuDropdown.classList.add("hidden");
      }
    });
  }

  // Chatbot toggle
  const chatbotButton = document.getElementById("chatbotButton");
  const chatbotPanel = document.getElementById("chatbotPanel");
  if (chatbotButton && chatbotPanel) {
    chatbotButton.addEventListener("click", () => {
      chatbotPanel.classList.toggle("hidden");
    });
  }

  // Mini-slots toggle
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
    // Simple canned reply to keep it light
    const lower = msg.toLowerCase();
    if (lower.includes("control") || lower.includes("how")) {
      addMessage(
        "Use ← / → or A / D to move and Space to charge. Push the opponent out of the ring!",
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

  // Initialize fighters
  sumoState.player = {
    x: canvas.width / 2 - 90,
    y: canvas.height / 2 + 40,
    vx: 0,
    facing: 1,
    stamina: 100,
    anim: "idle",
    phase: Math.random() * Math.PI * 2,
    pushCooldown: 0,
  };

  sumoState.cpu = {
    x: canvas.width / 2 + 90,
    y: canvas.height / 2 + 40,
    vx: 0,
    facing: -1,
    stamina: 100,
    anim: "idle",
    phase: Math.random() * Math.PI * 2,
    aiTimer: 0.5,
    pushCooldown: 0,
  };

  sumoState.ref = {
    phase: 0,
  };

  // Create full-body spectators
  sumoState.crowd = [];
  const count = 40;
  for (let i = 0; i < count; i++) {
    const x = 60 + Math.random() * (canvas.width - 120);
    const yBase = 80 + Math.random() * 80;
    sumoState.crowd.push({
      x,
      yBase,
      amp: 3 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      bodyColor: randomChoice([
        "#e74c3c",
        "#3498db",
        "#9b59b6",
        "#1abc9c",
        "#f1c40f",
      ]),
      height: 34 + Math.random() * 14,
    });
  }

  // Input setup
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
  if (!player || !cpu) return;

  player.x = canvas.width / 2 - 90;
  cpu.x = canvas.width / 2 + 90;
  player.stamina = 100;
  cpu.stamina = 100;
  player.vx = cpu.vx = 0;
  player.anim = cpu.anim = "idle";
  player.pushCooldown = cpu.pushCooldown = 0;
  sumoState.boutOver = false;
  setGameMessage("Move with ← → or A / D, Space to charge. Push opponent out of the ring!");
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

  // Cooldowns
  player.pushCooldown = Math.max(0, player.pushCooldown - dt);
  cpu.pushCooldown = Math.max(0, cpu.pushCooldown - dt);

  updateUI(player, cpu);
}

function handlePlayerInput(p, dt) {
  const speed = 180;
  let dir = 0;
  if (sumoState.keys["arrowleft"] || sumoState.keys["a"]) dir -= 1;
  if (sumoState.keys["arrowright"] || sumoState.keys["d"]) dir += 1;

  if (dir !== 0) {
    p.vx = dir * speed;
    p.facing = dir > 0 ? 1 : -1;
    if (p.anim === "idle") p.anim = "walk";
  } else {
    p.vx = 0;
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
  let targetX = canvas.width / 2 + 60;

  if (Math.abs(c.x - player.x) > 110) {
    targetX = player.x + 70;
  }

  const dir = Math.sign(targetX - c.x);
  c.vx = dir * speed;
  c.facing = dir > 0 ? 1 : -1;
  if (c.vx !== 0) {
    if (c.anim === "idle") c.anim = "walk";
  } else if (c.anim === "walk") {
    c.anim = "idle";
  }

  if (c.aiTimer <= 0 && c.pushCooldown <= 0) {
    if (Math.abs(c.x - player.x) < 200) {
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
  p.x += p.vx * dt;
  c.x += c.vx * dt;

  const centerX = canvas.width / 2;
  const maxOffset = sumoState.ringRadius - 30;

  p.x = Math.min(centerX + maxOffset, Math.max(centerX - maxOffset, p.x));
  c.x = Math.min(centerX + maxOffset, Math.max(centerX - maxOffset, c.x));

  // Check ring-out
  if (!sumoState.boutOver) {
    const pOff = Math.abs(p.x - centerX);
    const cOff = Math.abs(c.x - centerX);
    if (p.stamina <= 0 || pOff > maxOffset + 5) {
      endBout("cpu");
    } else if (c.stamina <= 0 || cOff > maxOffset + 5) {
      endBout("player");
    }
  }

  // Push effect animation
  if (sumoState.pushEffect.active) {
    sumoState.pushEffect.scale += dt * 2.2;
    if (sumoState.pushEffect.scale > 1.5) {
      sumoState.pushEffect.active = false;
    }
  }
}

function attemptClash(cpuInitiated) {
  const { player, cpu } = sumoState;
  if (sumoState.boutOver) return;

  const dist = Math.abs(player.x - cpu.x);
  if (dist > 190) return; // too far, whiff

  // Visual effect
  sumoState.pushEffect.active = true;
  sumoState.pushEffect.x = (player.x + cpu.x) / 2;
  sumoState.pushEffect.y = canvas.height / 2 + 40;
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

  const push = diff * 1.2;

  if (winner === "player") {
    cpu.x += Math.sign(cpu.x - player.x) * push;
    cpu.stamina -= diff * 1.2;
    setGameMessage("You drive the opponent back!");
    player.anim = "push";
  } else {
    player.x += Math.sign(player.x - cpu.x) * push;
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
    stats.bestStreak = Math.max(
      stats.bestStreak || 0,
      stats.currentStreak || 0
    );
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

  drawCrowd();
  drawDohyo();
  drawReferee();
  drawFighter(player, "#e74c3c", true);
  drawFighter(cpu, "#3498db", false);
  drawPushCircle();
}

function drawCrowd() {
  const t = sumoState.time;
  const crowd = sumoState.crowd;
  for (const s of crowd) {
    const y = s.yBase + Math.sin(t * 2 + s.phase) * s.amp;
    const h = s.height;
    const x = s.x;

    // legs
    ctx.fillStyle = "#111";
    ctx.fillRect(x + 2, y + h - 6, 6, 6);
    ctx.fillRect(x + 12, y + h - 6, 6, 6);

    // body
    ctx.fillStyle = s.bodyColor;
    ctx.fillRect(x, y + 6, 20, h - 12);

    // head
    ctx.fillStyle = "#f3d5b5";
    ctx.beginPath();
    ctx.arc(x + 10, y, 8, 0, Math.PI * 2);
    ctx.fill();

    // simple face
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 7, y - 3, 2, 2); // left eye
    ctx.fillRect(x + 11, y - 3, 2, 2); // right eye
  }
}

function drawDohyo() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + 40;
  const rOuter = sumoState.ringRadius + 20;
  const rInner = sumoState.ringRadius;

  // base
  const grd = ctx.createRadialGradient(cx, cy, 20, cx, cy, rOuter);
  grd.addColorStop(0, "#cfa36a");
  grd.addColorStop(1, "#7f5b2f");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
  ctx.fill();

  // circle ring
  ctx.strokeStyle = "#f8e0b0";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
  ctx.stroke();

  // starting lines
  ctx.fillStyle = "#f8e8d0";
  ctx.fillRect(cx - 60, cy - 4, 40, 8);
  ctx.fillRect(cx + 20, cy - 4, 40, 8);
}

function drawReferee() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 - 10;
  const t = sumoState.time;
  const bob = Math.sin(t * 3) * 2;

  // body (red kimono)
  ctx.fillStyle = "#b83232";
  ctx.fillRect(cx - 14, cy - 4 + bob, 28, 36);

  // head
  ctx.fillStyle = "#f1d2aa";
  ctx.beginPath();
  ctx.arc(cx, cy - 18 + bob, 12, 0, Math.PI * 2);
  ctx.fill();

  // hat
  ctx.fillStyle = "#11131a";
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy - 26 + bob);
  ctx.lineTo(cx + 14, cy - 26 + bob);
  ctx.lineTo(cx, cy - 46 + bob);
  ctx.closePath();
  ctx.fill();

  // arm (waving)
  ctx.strokeStyle = "#f1d2aa";
  ctx.lineWidth = 4;
  ctx.beginPath();
  const armAngle = Math.sin(t * 4) * 0.5;
  const ax1 = cx + 14;
  const ay1 = cy + 4 + bob;
  const armLen = 22;
  const ax2 = ax1 + armLen * Math.cos(armAngle);
  const ay2 = ay1 + armLen * Math.sin(armAngle);
  ctx.moveTo(ax1, ay1);
  ctx.lineTo(ax2, ay2);
  ctx.stroke();
}

function drawFighter(f, beltColor, isPlayer) {
  const t = sumoState.time;
  const cx = f.x;
  const cy = f.y;
  const wobble = Math.sin(t * 4 + f.phase) * 3;

  const facing = f.facing || 1;
  ctx.save();
  ctx.translate(cx, cy);
  if (facing < 0) ctx.scale(-1, 1);
  ctx.translate(0, wobble);

  // Body
  ctx.fillStyle = "#f3d0a0";
  ctx.beginPath();
  ctx.ellipse(0, 30, 40, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belt
  ctx.fillStyle = beltColor;
  ctx.fillRect(-44, 40, 88, 18);

  // Head
  ctx.fillStyle = "#f3d0a0";
  ctx.beginPath();
  ctx.arc(0, -10, 26, 0, Math.PI * 2);
  ctx.fill();

  // Hair (top knot) using arc for compatibility
  ctx.save();
  ctx.fillStyle = "#1b1411";
  ctx.beginPath();
  ctx.arc(0, -26, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Eyes
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(-8, -12, 3, 0, Math.PI * 2);
  ctx.arc(8, -12, 3, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (expression changes slightly based on stamina)
  const tired = f.stamina < 35;
  ctx.strokeStyle = "#a03030";
  ctx.lineWidth = tired ? 3 : 2;
  ctx.beginPath();
  if (isPlayer) {
    // Player mouth slight smile / grit
    ctx.arc(0, -2, tired ? 8 : 10, 0.1 * Math.PI, 0.9 * Math.PI);
  } else {
    // CPU mouth
    ctx.arc(0, -2, tired ? 8 : 10, 1.1 * Math.PI, 1.9 * Math.PI);
  }
  ctx.stroke();

  // Arms
  ctx.fillStyle = "#f3d0a0";
  let armRaise = 0;
  if (f.anim === "charge" || f.anim === "push") {
    armRaise = -10;
  } else if (f.anim === "walk") {
    armRaise = Math.sin(t * 8 + f.phase) * 6;
  }

  // Left arm
  ctx.fillRect(-44, 10 + armRaise, 12, 28);
  // Right arm
  ctx.fillRect(32, 10 + armRaise, 12, 28);

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
