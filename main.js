// Utility selectors
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* Tabs */
function switchTab(name){
  $$('.panel').forEach(p=>p.classList.toggle('active',p.id===`panel-${name}`));
  $$('.tab').forEach(t=>t.setAttribute('aria-selected', t.dataset.tab===name));
  if(name==='leaderboard'){ renderLeaderboard(); }
}

/* Menu + themes */
function toggleMenu(){
  const dd = $('#menuDropdown');
  if(!dd) return;
  if(dd.innerHTML.trim()===''){ buildMenuContents(); }
  dd.classList.toggle('hidden');
}

function buildMenuContents(){
  const dd = $('#menuDropdown');
  if(!dd) return;
  dd.innerHTML = document.querySelector('#panel-home') ? document.querySelector('#menuDropdownTemplate')?.innerHTML || dd.innerHTML : dd.innerHTML;
}

const themeData = [
  {id:1, name:'Default Ice', cost:0},
  {id:2, name:'Midnight Rink', cost:0},
  {id:3, name:'Day Game', cost:0},
  {id:4, name:'Neon Freeze', cost:100},
  {id:5, name:'Aurora Rink', cost:200},
  {id:6, name:'Shadow Arena', cost:400},
  {id:7, name:'Glacier Pulse', cost:800},
  {id:8, name:'Crimson Clash', cost:1600},
  {id:9, name:'Diamond Tier', cost:3200},
  {id:10, name:'Legendary Ice', cost:6400}
];

function initThemes(){
  const list = document.querySelector('.themes-list');
  if(!list) return;
  list.innerHTML = '';
  themeData.forEach(t=>{
    const btn = document.createElement('button');
    btn.className = 'theme-pill';
    btn.innerHTML = `<span>${t.id}. ${t.name}</span><span class="cost">${t.cost? t.cost+'c' : 'FREE'}</span>`;
    btn.onclick = ()=>applyTheme(t.id,t.cost);
    list.appendChild(btn);
  });
}

let userCoins = 1000;
function applyTheme(id,cost){
  if(cost>0 && userCoins<cost){
    alert('Not enough coins for this theme.');
    return;
  }
  if(cost>0){
    userCoins -= cost;
  }
  document.body.className = document.body.className.replace(/theme-\d+/,'').trim();
  document.body.classList.add(`theme-${id}`);
}

/* Slots */
const slotSymbols = ['❄️','🏒','🥅','⭐','🔥','🎁'];
let slotsBalance = 1000;
function buildReels(){
  const reelsEl = $('#reels');
  if(!reelsEl) return;
  reelsEl.innerHTML='';
  const reelCount = parseInt($('#reelsSelect').value,10);
  for(let i=0;i<reelCount;i++){
    const reel = document.createElement('div');
    reel.className='reel';
    const cell = document.createElement('div');
    cell.className='cell';
    cell.textContent = slotSymbols[Math.floor(Math.random()*slotSymbols.length)];
    reel.appendChild(cell);
    reelsEl.appendChild(reel);
  }
}
function toggleSlots(){
  const m = $('#slotsModal');
  if(!m) return;
  if(m.innerHTML.trim()===''){ // first open on profile page will have empty shell
    m.innerHTML = document.querySelector('#slotsModalTemplate')?.innerHTML || m.innerHTML;
  }
  m.classList.toggle('hidden');
}
function pullLever(){
  const lever = $('#lever');
  if(!lever) return;
  lever.classList.remove('pull');
  void lever.offsetWidth;
  lever.classList.add('pull');
}
function spinSlots(){
  const bet = parseInt($('#betSelect').value,10);
  if(slotsBalance<bet){
    $('#slotsResult').textContent = 'Not enough coins.';
    return;
  }
  pullLever();
  const reels = $$('.reel .cell');
  let matches = 1;
  let lastSymbol = null;
  reels.forEach(c=>{
    const sym = slotSymbols[Math.floor(Math.random()*slotSymbols.length)];
    c.textContent = sym;
    if(lastSymbol===sym) matches++; else matches=1;
    lastSymbol = sym;
  });
  slotsBalance -= bet;
  let win = 0;
  if(matches>=reels.length){
    win = bet*5;
  }else if(matches>=3){
    win = bet*2;
  }
  slotsBalance += win;
  $('#slotsBalance').textContent = `Balance: ${slotsBalance.toLocaleString()} coins`;
  $('#slotsResult').textContent = win>0 ? `You won ${win} coins!` : 'No win this time.';
}

/* Chatbot */
const greetings = {
  en:'Welcome to NHL Sports Hub! How can I help?',
  zh:'欢迎来到 NHL 体育中心！我能帮你什么？',
  hi:'NHL स्पोर्ट्स हब में आपका स्वागत है! मैं कैसे मदद कर सकता हूँ?',
  es:'¡Bienvenido a NHL Sports Hub! ¿En qué puedo ayudarte?',
  fr:'Bienvenue sur NHL Sports Hub ! Comment puis‑je vous aider ?',
  ar:'مرحبًا بك في مركز NHL الرياضي! كيف يمكنني مساعدتك؟',
  bn:'এনএইচএল স্পোর্টস হাবে স্বাগতম! কীভাবে সাহায্য করতে পারি?',
  pt:'Bem‑vindo ao NHL Sports Hub! Como posso ajudar?',
  ru:'Добро пожаловать в NHL Sports Hub! Чем я могу помочь?',
  ur:'این ایچ ایل اسپورٹس ہب میں خوش آمدید! میں آپ کی کیا مدد کر سکتا ہوں؟'
};
function toggleChat(){
  const m = $('#chatModal');
  if(!m) return;
  if(m.innerHTML.trim()===''){
    m.innerHTML = document.querySelector('#chatModalTemplate')?.innerHTML || m.innerHTML;
  }
  m.classList.toggle('hidden');
  if(!m.classList.contains('hidden')) resetChatGreeting();
}
function resetChatGreeting(){
  const log = $('#chatLog');
  if(!log) return;
  log.innerHTML='';
  const lang = $('#chatLang')?.value || 'en';
  addMsg('bot', greetings[lang] || greetings.en);
}
function addMsg(who,text){
  const log = $('#chatLog');
  if(!log) return;
  const wrap = document.createElement('div');
  wrap.className='msg-wrap';
  const msg = document.createElement('div');
  msg.className='msg ' + (who==='me'?'me':'bot');
  msg.textContent=text;
  wrap.appendChild(msg);
  log.appendChild(wrap);
  log.scrollTop = log.scrollHeight;
}
function sendChat(){
  const inp = $('#chatInput');
  if(!inp || !inp.value.trim()) return;
  const text = inp.value.trim();
  addMsg('me',text);
  // Tiny canned response
  addMsg('bot','Got it! Imagine a smart assistant here answering in detail.');
  inp.value='';
}

/* Sumo mini‑game */
let sumoScore = 0;
function drawRing(){
  const canvas = $('#sumoRing');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#07101f';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.beginPath();
  ctx.arc(canvas.width/2,canvas.height/2,50,0,Math.PI*2);
  ctx.strokeStyle='#d4d7ff';
  ctx.lineWidth=4;
  ctx.stroke();
  // player
  ctx.fillStyle='#4cafef';
  ctx.beginPath();
  ctx.arc(canvas.width/2-20,canvas.height/2,14,0,Math.PI*2);
  ctx.fill();
  // AI
  ctx.fillStyle='#ef5350';
  ctx.beginPath();
  ctx.arc(canvas.width/2+20,canvas.height/2,14,0,Math.PI*2);
  ctx.fill();
}
function playSumo(type){
  const name = $('#sumoName').value.trim() || 'Player';
  const playerPower = type==='heavy'? (Math.random()*0.8+0.7) : (Math.random()*0.8+0.5);
  const aiPower = Math.random()*1.2+0.4;
  let status;
  if(playerPower>aiPower){
    sumoScore++;
    status = `${name} wins the shove! Streak ${sumoScore}.`;
  }else{
    status = `${name} gets pushed out of the circle. Streak reset.`;
    sumoScore=0;
  }
  $('#sumoScore').textContent = `Score: ${sumoScore}`;
  $('#sumoStatus').textContent = status;
  saveLeaderboard(name,sumoScore);
  drawRing();
}
function saveLeaderboard(name,score){
  if(score<=0) return;
  const key='sumoLeaderboard';
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  const existing = data.find(d=>d.name===name);
  if(existing){
    if(score>existing.score) existing.score = score;
  }else{
    data.push({name,score});
  }
  data.sort((a,b)=>b.score-a.score);
  localStorage.setItem(key,JSON.stringify(data.slice(0,20)));
}
function renderLeaderboard(){
  const key='sumoLeaderboard';
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  const tbody = $('#sumoLeaderboard tbody');
  if(!tbody) return;
  tbody.innerHTML='';
  data.forEach((row,idx)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx+1}</td><td>${row.name}</td><td>${row.score}</td>`;
    tbody.appendChild(tr);
  });
}

/* Toast / online counter */
function initOnlineCounter(){
  const el = $('#onlineCount');
  if(!el) return;
  const base = 7;
  const jitter = Math.floor(Math.random()*5);
  el.textContent = (base + jitter).toString().padStart(6,'0');
}

/* Shared init */
document.addEventListener('DOMContentLoaded',()=>{
  try{
    drawRing();
    initThemes();
    buildReels();
    resetChatGreeting();
    initOnlineCounter();
  }catch(e){
    console.error(e);
  }

  // Profile name binding
  const nameInput = $('#profileNameInput');
  if(nameInput){
    nameInput.addEventListener('input',()=>{
      const v = nameInput.value.trim() || 'Your Player';
      const el = $('#profileName');
      if(el) el.textContent = v;
    });
  }
  const autoSpin = $('#autoSpin');
  const buddy = document.querySelector('.profile-hero .buddy');
  if(autoSpin && buddy){
    autoSpin.addEventListener('change',()=>{
      buddy.style.animationPlayState = autoSpin.checked ? 'running':'paused';
    });
  }
});
