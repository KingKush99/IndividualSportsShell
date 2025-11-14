const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const msgBar = document.getElementById('msgBar');
const hpPlayerEl = document.getElementById('hpPlayer');
const hpCpuEl = document.getElementById('hpCpu');

const assets = {};
const toLoad = [
  ['player','assets/sumo_player.png'],
  ['cpu','assets/sumo_cpu.png'],
  ['ref','assets/referee.png'],
  ['crowd','assets/crowd.png'],
  ['dohyo','assets/dohyo.png'],
  ['push','assets/push_effect.png'],
];

let loaded = 0;
function loadAssets(cb){
  toLoad.forEach(([key,src])=>{
    const img = new Image();
    img.onload = ()=>{
      assets[key]=img;
      loaded++;
      if(loaded===toLoad.length) cb();
    };
    img.src = src;
  });
}

const FW = 128, FH = 128;
const REF_FW = 96, REF_FH = 128;

const state = {
  player:{
    x: canvas.width/2 - 90,
    y: canvas.height/2 + 40,
    vx:0,
    facing:1,
    stamina:100,
    anim:'idle',
    frame:0,
    frameTime:0,
  },
  cpu:{
    x: canvas.width/2 + 90,
    y: canvas.height/2 + 40,
    vx:0,
    facing:-1,
    stamina:100,
    anim:'idle',
    frame:0,
    frameTime:0,
    aiTimer:0
  },
  ref:{
    frame:0,
    frameTime:0
  },
  pushEffect:{
    active:false,
    x: canvas.width/2,
    y: canvas.height/2+40,
    scale:0
  },
  keys:{},
  ringRadius:170,
  boutOver:false
};

function setMessage(text){
  msgBar.textContent = text;
}

function resetBout(){
  state.player.x = canvas.width/2 - 90;
  state.cpu.x = canvas.width/2 + 90;
  state.player.stamina = 100;
  state.cpu.stamina = 100;
  state.player.vx = state.cpu.vx = 0;
  state.player.anim = state.cpu.anim = 'idle';
  state.player.frame = state.cpu.frame = 0;
  state.player.frameTime = state.cpu.frameTime = 0;
  state.ref.frame = 0;
  state.ref.frameTime = 0;
  state.pushEffect.active = false;
  state.boutOver = false;
  setMessage('Move with ← →, charge with Space. Push your opponent out of the ring!');
}

document.addEventListener('keydown', e=>{
  state.keys[e.key.toLowerCase()] = true;
  if(e.code==='Space') e.preventDefault();
});
document.addEventListener('keyup', e=>{
  state.keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('click', ()=>{
  if(state.boutOver) resetBout();
});

function update(dt){
  if(!state.boutOver){
    handlePlayerInput(dt);
    handleCpuAI(dt);
    handlePhysics(dt);
  }
  updateAnim(state.player, dt);
  updateAnim(state.cpu, dt);
  updateRef(dt);
  updateUI();
}

function handlePlayerInput(dt){
  const p = state.player;
  const speed = 180;
  let dir = 0;
  if(state.keys['arrowleft'] || state.keys['a']) dir -= 1;
  if(state.keys['arrowright'] || state.keys['d']) dir += 1;

  if(dir!==0){
    p.vx = dir*speed;
    p.facing = dir>0?1:-1;
    if(p.anim==='idle') p.anim = 'walk';
  }else{
    p.vx = 0;
    if(p.anim==='walk') p.anim='idle';
  }
  if(state.keys[' '] || state.keys['space']){
    if(p.anim!=='charge' && p.anim!=='push'){
      p.anim='charge';
      p.frame=0;
      p.frameTime=0;
      attemptClash();
    }
  }
}

function handleCpuAI(dt){
  const c = state.cpu;
  const p = state.player;
  const speed = 150;
  c.aiTimer -= dt;
  let targetX = canvas.width/2 + 60;
  // basic AI: move near player
  if(Math.abs(c.x - p.x)>100) targetX = p.x + 60;
  const dir = Math.sign(targetX - c.x);
  c.vx = dir*speed;
  c.facing = dir>0?1:-1;
  if(Math.abs(targetX-c.x)<10) c.vx = 0;

  if(c.vx!==0){
    if(c.anim==='idle') c.anim='walk';
  }else if(c.anim==='walk'){
    c.anim='idle';
  }

  if(c.aiTimer<=0){
    // decide to charge if close enough
    if(Math.abs(c.x - p.x)<200){
      c.anim='charge';
      c.frame=0;
      c.frameTime=0;
      attemptClash(true);
      c.aiTimer = 1.2;
    }else{
      c.aiTimer = 0.4;
    }
  }
}

function handlePhysics(dt){
  const p = state.player;
  const c = state.cpu;
  p.x += p.vx*dt;
  c.x += c.vx*dt;
  const centerX = canvas.width/2;
  const centerY = canvas.height/2+40;
  // clamp to ring radius in 1D along x (approx)
  const maxOffset = state.ringRadius-30;
  p.x = Math.min(centerX+maxOffset, Math.max(centerX-maxOffset, p.x));
  c.x = Math.min(centerX+maxOffset, Math.max(centerX-maxOffset, c.x));

  // check ring-out
  if(!state.boutOver){
    const pOff = Math.abs(p.x-centerX);
    const cOff = Math.abs(c.x-centerX);
    if(p.stamina<=0 || pOff>maxOffset+5){
      endBout('cpu');
    }else if(c.stamina<=0 || cOff>maxOffset+5){
      endBout('player');
    }
  }

  if(state.pushEffect.active){
    state.pushEffect.scale += dt*2.5;
    if(state.pushEffect.scale>1.5) state.pushEffect.active=false;
  }
}

function attemptClash(cpuInitiated=false){
  const p = state.player;
  const c = state.cpu;
  if(state.boutOver) return;
  const dist = Math.abs(p.x - c.x);
  if(dist>190) return; // too far, whiff

  // collision -> resolve push
  state.pushEffect.active=true;
  state.pushEffect.x = (p.x+c.x)/2;
  state.pushEffect.y = canvas.height/2+40;
  state.pushEffect.scale = 0.3;

  const base = 15 + Math.random()*20;
  const playerRoll = base + (cpuInitiated?0:10) + Math.random()*20;
  const cpuRoll = base + (cpuInitiated?12:2) + Math.random()*20;

  let winner = null;
  let diff = 0;
  if(playerRoll>cpuRoll){
    winner='player';
    diff = playerRoll-cpuRoll;
  }else{
    winner='cpu';
    diff = cpuRoll-playerRoll;
  }

  const push = diff*1.2;
  if(winner==='player'){
    c.x += Math.sign(c.x-p.x)*push;
    c.stamina -= diff*1.2;
    setMessage('You drive the opponent back!');
    p.anim='push';
  }else{
    p.x += Math.sign(p.x-c.x)*push;
    p.stamina -= diff*1.2;
    setMessage('You are forced toward the edge!');
    c.anim='push';
  }
}

function endBout(winner){
  state.boutOver=true;
  if(winner==='player'){
    setMessage('You win! Click the ring to start a new bout.');
  }else{
    setMessage('CPU wins. Click the ring to try again.');
  }
}

function updateAnim(f, dt){
  f.frameTime += dt;
  const speed = f.anim==='walk'?0.12:(f.anim==='charge'||f.anim==='push'?0.08:0.16);
  const maxFrames = 8;
  while(f.frameTime>speed){
    f.frameTime-=speed;
    f.frame = (f.frame+1)%maxFrames;
    if(f.anim==='charge' && f.frame===4){
      f.anim='idle';
    }
    if(f.anim==='push' && f.frame===5){
      f.anim='idle';
    }
  }
}

function updateRef(dt){
  state.ref.frameTime += dt;
  const speed=0.2;
  const maxFrames=4;
  while(state.ref.frameTime>speed){
    state.ref.frameTime-=speed;
    state.ref.frame=(state.ref.frame+1)%maxFrames;
  }
}

function updateUI(){
  hpPlayerEl.style.width = Math.max(0, state.player.stamina)+'%';
  hpCpuEl.style.width = Math.max(0, state.cpu.stamina)+'%';
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawCrowd();
  drawDohyo();
  drawReferee();
  drawFighter(state.player, assets.player);
  drawFighter(state.cpu, assets.cpu);
  drawPushEffect();
}

function drawCrowd(){
  const img = assets.crowd;
  if(!img) return;
  ctx.drawImage(img,0,0);
}

function drawDohyo(){
  const img = assets.dohyo;
  if(!img) return;
  const y = canvas.height/2-40;
  ctx.drawImage(img,0,y);
}

function drawReferee(){
  const img = assets.ref;
  if(!img) return;
  const frame = state.ref.frame;
  const sx = frame*REF_FW;
  const sy = 0;
  const dx = canvas.width/2-REF_FW/2;
  const dy = canvas.height/2-40;
  ctx.drawImage(img,sx,sy,REF_FW,REF_FH,dx,dy,REF_FW,REF_FH);
}

function drawFighter(f, sheet){
  if(!sheet) return;
  const frame = f.frame;
  const cols = 4;
  const sx = (frame%cols)*FW;
  const sy = Math.floor(frame/cols)*FH;
  const scale = 1.1;
  const dw = FW*scale;
  const dh = FH*scale;
  let dx = f.x - dw/2;
  let dy = f.y - dh/2 - 40;
  ctx.save();
  if(f.facing<0){
    ctx.translate(dx+dw,0);
    ctx.scale(-1,1);
    dx = 0;
  }
  ctx.drawImage(sheet,sx,sy,FW,FH,dx,dy,dw,dh);
  ctx.restore();
}

function drawPushEffect(){
  if(!state.pushEffect.active) return;
  const img = assets.push;
  if(!img) return;
  const s = state.pushEffect.scale;
  const w = img.width*s;
  const h = img.height*s;
  const dx = state.pushEffect.x - w/2;
  const dy = state.pushEffect.y - h/2;
  ctx.globalAlpha = 0.7*(1.5-s);
  ctx.drawImage(img,dx,dy,w,h);
  ctx.globalAlpha = 1;
}

let lastTime = 0;
function loop(timestamp){
  if(!lastTime) lastTime = timestamp;
  const dt = (timestamp-lastTime)/1000;
  lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

loadAssets(()=>{
  resetBout();
  requestAnimationFrame(loop);
});
