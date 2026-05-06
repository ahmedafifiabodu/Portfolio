/* journey.js — 2D platformer career timeline */
(function () {
  'use strict';

  const canvas = document.getElementById('journey-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ── CONFIG ─────────────────────────────────────── */
  const WORLD_W    = 6200;
  const GRAVITY    = 1700;
  const SPEED      = 230;
  const JUMP_VEL   = -720;
  const GND_RATIO  = 0.72;
  const PLT_H      = 14;

  /* ── STATE ───────────────────────────────────────── */
  let gameState = 'intro';
  let introAnim = 0;
  let introBtns = { start: null, skip: null };

  /* ── RESIZE ──────────────────────────────────────── */
  let W, H;
  function resize() {
    W = canvas.width  = canvas.parentElement.clientWidth;
    H = canvas.height = Math.round(Math.min(430, Math.max(310, W * 0.42)));
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── CAREER MILESTONES ───────────────────────────── */
  const MILESTONES = [
    {
      type:'career', wx: 250, w: 160, elev: 14, color: '#00ffa3',
      title: 'IT Specialist', company: 'Elfath Group',
      period: 'Aug 2013 – Jan 2023',
      desc: 'Built websites, databases & digital environments. Ensured scalable & secure infrastructure across departments for seamless communication and data flow.',
    },
    {
      type:'career', wx: 750, w: 165, elev: 52, color: '#00d4ff',
      title: 'Technical Support', company: 'Concentrix',
      period: 'Sep 2022 – Mar 2023',
      desc: 'Provided excellent customer care, resolving issues promptly with consistent follow-up. Maintained positive attitude and fostered empathy for team morale.',
    },
    {
      type:'career', wx: 1350, w: 185, elev: 90, color: '#a855f7',
      title: 'Bachelor of CS', company: 'Modern Academy',
      period: 'Sep 2018 – May 2022',
      desc: 'Studied algorithms, data structures, software engineering & programming fundamentals at the Bachelor of Computer Science program.',
    },
    {
      type:'career', wx: 2000, w: 185, elev: 120, color: '#f59e0b',
      title: 'Game Programming Diploma', company: 'ITI',
      period: 'Aug 2023 – Jun 2024',
      desc: 'Intensive 9-month professional diploma focused on game development, engine internals (Unity & Unreal), and game programming best practices.',
    },
    {
      type:'career', wx: 3600, w: 195, elev: 58, color: '#ff6b9d',
      title: 'Game Developer', company: 'Futuregames Warsaw',
      period: 'Sep 2025 – Mar 2026',
      desc: 'Internship at Futuregames in Warsaw, Poland. Digital games in a studio environment, sharpening professional game dev skills.',
    },
    {
      type:'career', wx: 5750, w: 190, elev: 80, color: '#00ffa3',
      title: 'Game Developer', company: '2024 Studios',
      period: 'Nov 2024 – Present',
      desc: 'Designing & programming engaging gameplay mechanics. Collaborating with artists to bring concepts to life and contributing to multiplayer game development.',
    },
  ];

  /* ── GAME COLLECTABLES ───────────────────────────── */
  /* elevBase: static height of gem base above ground; gem bobs ±7px on top */
  const COLLECTABLES = [
    /* — ITI era (after Game Programming Diploma @ 2000) — */
    {
      type:'game', wx:2300, elevBase:55, offset:0.0, collected:false, color:'#f59e0b',
      title:'Dawn of the Last Seeds', tag:'Zanga Game Jam',
      period:'Mid ITI · 2023',
      itchio:'https://nourhan-taman.itch.io/dawn-of-the-last-seeds',
      github:'https://github.com/NourhanToman/ZnaaJam2024',
      coverImg:'https://img.itch.zone/aW1nLzE1MjUyNTcxLnBuZw==/original/13QBvi.png',
      desc:'In a world of drought, the last three seeds are humanity\'s only hope to survive. Built during the Zanga Game Jam while at ITI.',
    },
    {
      type:'game', wx:2600, elevBase:100, offset:1.1, collected:false, color:'#f59e0b',
      title:'Righteous Crane', tag:'Egypt Game Jam',
      period:'During ITI · 2023',
      itchio:'https://mohamed-elkholy.itch.io/righteous-crane',
      github:'https://github.com/ahmedafifiabodu/Dressrosa',
      coverImg:'https://img.itch.zone/aW1nLzE1MjgxNjM1LnBuZw==/original/lO3Zf5.png',
      desc:'Play as the land\'s righteous crane, striving to solve the people\'s problems. Created at the Egypt Game Jam during ITI.',
    },
    {
      type:'game', wx:2950, elevBase:65, offset:2.3, collected:false, color:'#f59e0b',
      title:'The Kitten & The Hidden', tag:'Graduation Project',
      period:'End of ITI · 2024',
      itchio:'https://nayrayehya.itch.io/the-kitten-and-the-hidden',
      github:'https://github.com/1Rooky/The-Kitten-and-The-Hidden',
      coverImg:'https://img.itch.zone/aW1nLzE2OTgyNTI1LnBuZw==/original/glyJIm.png',
      desc:'A ghost wanders the world with a persistent cat companion — his beloved pet from a past life. The graduation project at the end of ITI.',
    },
    /* — Futuregames era (after Futuregames Warsaw @ 3600) — */
    {
      type:'game', wx:3950, elevBase:45, offset:0.5, collected:false, color:'#ff6b9d',
      title:'Vampire Survival', tag:'Game Assignment',
      period:'Futuregames · 2025',
      itchio:'https://ahmedafifiabodu.itch.io/vampire-survival',
      github:'https://github.com/ahmedafifiabodu/VampireSurvivors',
      coverImg:'https://img.itch.zone/aW1nLzIzNjcxNzY0LnBuZw==/original/JUaJTr.png',
      desc:'Survive endless waves of enemies, grow your powers, and outlast the night. A game assignment completed at Futuregames Warsaw.',
    },
    {
      type:'game', wx:4250, elevBase:90, offset:1.7, collected:false, color:'#ff6b9d',
      title:'Project Trash', tag:'GP1',
      period:'Futuregames · 2025',
      itchio:'https://futuregames.itch.io/projecttrash',
      github:'https://github.com/F8Code/ProjectTrash',
      coverImg:'https://img.itch.zone/aW1nLzI0Mjg4OTM1LnBuZw==/original/fH3JnI.png',
      desc:'Employed to recycle — sort fast, sort correctly, don\'t get fired! Group Project 1 at Futuregames following professional studio workflow.',
    },
    {
      type:'game', wx:4550, elevBase:60, offset:3.1, collected:false, color:'#ff6b9d',
      title:'Forest of the Wicked', tag:'Game Jam',
      period:'Futuregames · 2025',
      itchio:'https://gothmothdev.itch.io/forest-of-the-wicked',
      github:'https://github.com/untalpanda/ForestOfTheWicked-v1.0',
      coverImg:'https://img.itch.zone/aW1nLzIzNjQ5MzEyLnBuZw==/original/3XCMBk.png',
      desc:'A dark atmospheric horror-adventure — dare to venture into the wicked forest. A game jam entry built with a passionate team.',
    },
    {
      type:'game', wx:4850, elevBase:115, offset:0.8, collected:false, color:'#ff6b9d',
      title:'Parasozhyt', tag:'Game Jam',
      period:'Futuregames · 2025',
      itchio:'https://gamekernel.itch.io/parasozhyt',
      github:'https://github.com/ahmedafifiabodu/FutureGameJam',
      coverImg:'https://img.itch.zone/aW1nLzIzNzU3OTkwLmpwZw==/original/nfW7g5.jpg',
      desc:'Fast-paced body-hopping shooter — survive by constantly switching hosts before they die. A jam entry at Futuregames.',
    },
    {
      type:'game', wx:5200, elevBase:70, offset:2.0, collected:false, color:'#ff6b9d',
      title:'Voita', tag:'GP2',
      period:'Futuregames · 2025–26',
      itchio:'https://futuregames.itch.io/voita',
      github:'https://github.com/hasanjahromi/SpaceStationEvolution',
      coverImg:'https://img.itch.zone/aW1nLzI1Njk2Mjc0LnBuZw==/original/8os3hT.png',
      desc:'Turn-based sci-fi predator game: set traps, drag bodies, evolve new powers. Group Project 2 — the final major project at Futuregames.',
    },
  ];

  const ALL_PLATFORMS = [...MILESTONES];

  /* ── STARS ───────────────────────────────────────── */
  const STARS = Array.from({ length: 100 }, () => ({
    wx: Math.random() * WORLD_W,
    y:  Math.random() * 250,
    r:  Math.random() * 1.4 + 0.3,
    a:  Math.random() * 0.5 + 0.2,
    sp: Math.random() * 0.2 + 0.04,
  }));

  /* ── CHARACTER ───────────────────────────────────── */
  const char = {
    wx: 60, wy: 0,
    vx: 0,  vy: 0,
    w: 22,  h: 34,
    onGround: false,
    facing: 1,
    frame: 0, frameTimer: 0,
    jumping: false,
    bounce: 0,
  };

  /* ── CAMERA & PARTICLES ──────────────────────────── */
  let camX = 0;
  const particles = [];

  function burst(wx, wy, color) {
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 70 + 30;
      particles.push({ wx, wy, vx: Math.cos(a)*s, vy: Math.sin(a)*s - 50,
        alpha: 1, color, life: 0.7 + Math.random() * 0.3 });
    }
  }

  /* ── INPUT ───────────────────────────────────────── */
  const keys = {};
  let focused = false;
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (focused && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))
      e.preventDefault();
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
  canvas.setAttribute('tabindex', '0');
  canvas.style.outline = 'none';
  canvas.addEventListener('focus', () => { focused = true; });
  canvas.addEventListener('blur',  () => { focused = false; });

  /* ── INTRO CLICK / HOVER ─────────────────────────── */
  function hitBtn(b, mx, my) {
    return b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
  }
  function startGame() {
    gameState = 'playing';
    const ctrl = document.getElementById('journey-controls');
    if (ctrl) ctrl.style.display = '';
    if (infoEl) { infoEl.style.display = ''; renderInfo(); }
    canvas.focus();
  }

  function resetGame() {
    COLLECTABLES.forEach(c => { c.collected = false; });
    char.wx = 60; char.wy = 0; char.vx = 0; char.vy = 0;
    char.onGround = false; char.jumping = false; char.bounce = 0;
    char.frame = 0; char.frameTimer = 0;
    camX = 0;
    activeMilestone = null;
    collectedGames  = [];
    particles.length = 0;
    renderInfo();
    canvas.focus();
  }
  canvas.addEventListener('click', e => {
    if (gameState === 'intro') {
      const r = canvas.getBoundingClientRect();
      const mx = (e.clientX - r.left) * (W / r.width);
      const my = (e.clientY - r.top)  * (H / r.height);
      if (hitBtn(introBtns.start, mx, my)) { startGame(); return; }
      if (hitBtn(introBtns.skip,  mx, my)) {
        const el = document.getElementById('games');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      canvas.focus();
    }
  });
  canvas.addEventListener('mousemove', e => {
    if (gameState !== 'intro') return;
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (W / r.width);
    const my = (e.clientY - r.top)  * (H / r.height);
    canvas.style.cursor =
      (hitBtn(introBtns.start, mx, my) || hitBtn(introBtns.skip, mx, my))
        ? 'pointer' : 'default';
  });

  /* ── MOBILE BUTTONS ──────────────────────────────── */
  let mLeft = false, mRight = false, mJump = false;
  (function buildButtons() {
    const wrap = document.getElementById('journey-controls');
    if (!wrap) return;
    wrap.style.display = 'none';   /* hidden until game starts */
    wrap.innerHTML =
      '<button id="jbL"   class="game-btn">&#9664;</button>' +
      '<button id="jbJ"   class="game-btn game-btn-jump">&#9650; Jump</button>' +
      '<button id="jbR"   class="game-btn">&#9654;</button>' +
      '<button id="jbRst" class="game-btn game-btn-rst" title="Restart">&#x21BA;</button>';
    function bind(id, setter) {
      const el = document.getElementById(id);
      el.addEventListener('touchstart', e => { e.preventDefault(); setter(true);  }, { passive: false });
      el.addEventListener('touchend',   e => { e.preventDefault(); setter(false); }, { passive: false });
      el.addEventListener('mousedown',  () => setter(true));
      el.addEventListener('mouseup',    () => setter(false));
      el.addEventListener('mouseleave', () => setter(false));
    }
    bind('jbL', v => mLeft  = v);
    bind('jbR', v => mRight = v);
    bind('jbJ', v => mJump  = v);
    document.getElementById('jbRst').addEventListener('click', resetGame);
  }());

  /* hide info panel until game starts */
  (function () {
    const info = document.getElementById('journey-info');
    if (info) info.style.display = 'none';
  }());

  /* ── HELPERS ─────────────────────────────────────── */
  function gndY()        { return H * GND_RATIO; }
  /* platSurface = y-coordinate where character's FEET touch the platform */
  function platSurface(m){ return gndY() - m.elev; }
  function toScreen(wx)  { return wx - camX; }
  function hexRgb(h)     { return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)].join(','); }

  /* ── INFO PANEL ──────────────────────────────────── */
  const infoEl = document.getElementById('journey-info');
  let activeMilestone = null;
  let collectedGames  = [];

  function gameCardHTML(g) {
    return `
      <div class="jm-card jm-game-card" style="--mc:${g.color}">
        <img class="jm-game-img" src="${g.coverImg}" alt="${g.title}" loading="lazy">
        <div class="jm-game-right">
          <div class="jm-left">
            <span class="jm-date">${g.period}</span>
            <h3 class="jm-title">${g.title}</h3>
            <span class="jm-company jm-tag">${g.tag}</span>
          </div>
          <p class="jm-desc">${g.desc}</p>
          <div class="jm-links">
            <a href="${g.itchio}" target="_blank" rel="noopener" class="jm-link jm-link-itch">🎮 itch.io</a>
            <a href="${g.github}" target="_blank" rel="noopener" class="jm-link jm-link-gh">&#x2B21; GitHub</a>
          </div>
        </div>
      </div>`;
  }

  function renderInfo() {
    if (!infoEl) return;
    let html = '';

    /* current career milestone (or hint if nothing) */
    if (activeMilestone) {
      html += `
        <div class="jm-card" style="--mc:${activeMilestone.color}">
          <div class="jm-left">
            <span class="jm-date">${activeMilestone.period}</span>
            <h3 class="jm-title">${activeMilestone.title}</h3>
            <span class="jm-company">${activeMilestone.company}</span>
          </div>
          <p class="jm-desc">${activeMilestone.desc}</p>
        </div>`;
    } else if (collectedGames.length === 0) {
      html += '<p class="journey-hint">🎮 Use <kbd>&#8592; &#8594;</kbd> to walk &nbsp;·&nbsp;' +
        ' <kbd>Space</kbd> or <kbd>&#8593;</kbd> to jump<br>' +
        'Step on career pillars · Collect the spinning gems to reveal games!</p>';
    }

    /* stacked collected games */
    if (collectedGames.length > 0) {
      html += `<div class="jm-collected-header">
        <span class="jm-collected-label">🎮 Collected Games <em>(${collectedGames.length}/${COLLECTABLES.length})</em></span>
      </div>
      <div class="jm-collected-list">`;
      for (const g of [...collectedGames].reverse()) html += gameCardHTML(g);
      html += '</div>';
    }

    infoEl.innerHTML = html;
  }

  /* ── UPDATE ──────────────────────────────────────── */
  let hudAlpha = 1, hudTimer = 0;

  function update(dt) {
    const left  = keys['ArrowLeft']  || keys['KeyA'] || mLeft;
    const right = keys['ArrowRight'] || keys['KeyD'] || mRight;
    const jump  = keys['ArrowUp']    || keys['KeyW'] || keys['Space'] || mJump;

    if (left)       { char.vx = -SPEED; char.facing = -1; }
    else if (right) { char.vx =  SPEED; char.facing =  1; }
    else            { char.vx *= 0.76; }

    if (jump && char.onGround) {
      char.vy = JUMP_VEL;
      char.onGround = false;
      char.jumping  = true;
    }

    char.vy += GRAVITY * dt;
    char.wx += char.vx * dt;
    char.wy += char.vy * dt;
    char.wx  = Math.max(10, Math.min(WORLD_W - char.w - 10, char.wx));

    const gY = gndY();
    char.onGround = false;

    /* ground */
    if (char.wy + char.h >= gY) {
      if (char.jumping) { burst(char.wx + char.w/2, gY, '#00ffa3'); char.bounce = 0.28; char.jumping = false; }
      char.wy = gY - char.h; char.vy = 0; char.onGround = true;
    }

    /* platforms */
    let stepped = null;
    for (const m of ALL_PLATFORMS) {
      const py = platSurface(m);
      if (char.vy >= 0
          && char.wy + char.h >= py
          && char.wy + char.h <= py + 28
          && char.wx + char.w > m.wx + 2
          && char.wx < m.wx + m.w - 2) {
        if (char.jumping) { burst(char.wx + char.w/2, py, m.color); char.bounce = 0.28; char.jumping = false; }
        char.wy = py - char.h; char.vy = 0; char.onGround = true;
        stepped = m;
      }
    }

    /* collectables */
    const _t = Date.now() / 1000;
    for (const c of COLLECTABLES) {
      if (c.collected) continue;
      const bob = Math.sin(_t * 1.8 + c.offset) * 7;
      const cy = gndY() - c.elevBase + bob;
      const dx = Math.abs((char.wx + char.w / 2) - c.wx);
      const dy = Math.abs((char.wy + char.h / 2) - cy);
      if (dx < 30 && dy < 36) {
        c.collected = true;
        burst(c.wx, cy, c.color);
        for (let i = 0; i < 5; i++) burst(c.wx, cy, c.color); // bigger pop
        collectedGames.push(c);
        activeMilestone = null; // clear career card so collected list shows
        renderInfo();
      }
    }

    if (stepped !== activeMilestone) {
      activeMilestone = stepped;
      renderInfo();
    }

    /* walk anim */
    if (Math.abs(char.vx) > 8 && char.onGround) {
      char.frameTimer += dt;
      if (char.frameTimer > 0.1) { char.frameTimer = 0; char.frame = (char.frame + 1) % 4; }
    } else if (!char.onGround) {
      char.frame = 2;
    } else {
      char.frame = 0;
    }

    char.bounce = Math.max(0, char.bounce - dt * 3.5);

    /* particles */
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.wx += p.vx * dt; p.wy += p.vy * dt;
      p.vy += 450 * dt;
      p.alpha -= dt / p.life;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    /* camera */
    const tx = char.wx + char.w / 2 - W / 2;
    camX += (tx - camX) * Math.min(1, dt * 9);
    camX  = Math.max(0, Math.min(WORLD_W - W, camX));

    hudTimer += dt;
    if (hudTimer > 3.5) hudAlpha = Math.max(0, hudAlpha - dt * 0.55);
  }

  /* ── DRAW ────────────────────────────────────────── */
  function drawBg() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#040609'); g.addColorStop(1, '#0b0e18');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    /* grid */
    ctx.strokeStyle = 'rgba(0,255,163,0.033)'; ctx.lineWidth = 1;
    const gs = 54, ox = (camX * 0.32) % gs;
    for (let x = -ox; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x, gndY()); ctx.stroke(); }
    for (let y = 0; y < gndY(); y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    /* stars */
    for (const s of STARS) {
      let sx = (s.wx - camX * s.sp + WORLD_W * 2) % WORLD_W;
      if (sx < 0 || sx > W + 4) continue;
      ctx.beginPath(); ctx.arc(sx, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`; ctx.fill();
    }
  }

  function drawGround() {
    const gY = gndY();
    ctx.fillStyle = '#070b12'; ctx.fillRect(0, gY, W, H - gY);
    ctx.save();
    ctx.shadowBlur = 14; ctx.shadowColor = '#00ffa3';
    ctx.strokeStyle = '#00ffa3'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, gY); ctx.lineTo(W, gY); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,255,163,0.05)'; ctx.lineWidth = 1;
    const tw = 44, to = camX % tw;
    for (let x = -to; x < W; x += tw) { ctx.beginPath(); ctx.moveTo(x, gY); ctx.lineTo(x, H); ctx.stroke(); }
  }

  function drawPlatforms() {
    const t = Date.now() / 1000;
    for (const m of ALL_PLATFORMS) {
      const sx = toScreen(m.wx);
      if (sx + m.w < -30 || sx > W + 30) continue;
      const py  = platSurface(m);
      const rgb = hexRgb(m.color);

      /* pillar */
      if (m.elev > PLT_H) {
        const pillarH = m.elev - PLT_H;
        const px = sx + m.w / 2 - 4;
        ctx.fillStyle   = `rgba(${rgb},0.10)`;
        ctx.strokeStyle = `rgba(${rgb},0.22)`; ctx.lineWidth = 1;
        ctx.fillRect(px,   py + PLT_H, 8, pillarH);
        ctx.strokeRect(px, py + PLT_H, 8, pillarH);
      }

      /* platform body */
      ctx.save();
      ctx.shadowBlur  = 20; ctx.shadowColor = m.color;
      ctx.fillStyle   = `rgba(${rgb},0.12)`;
      ctx.strokeStyle = m.color; ctx.lineWidth = 2;
      ctx.fillRect(sx,   py, m.w, PLT_H);
      ctx.strokeRect(sx, py, m.w, PLT_H);
      ctx.restore();

      /* corner accents */
      ctx.fillStyle = m.color;
      [[sx, py],[sx + m.w - 5, py]].forEach(([cx, cy]) => {
        ctx.fillRect(cx, cy, 5, 2); ctx.fillRect(cx, cy, 2, 5);
      });

      /* animated dots */
      const dots = Math.floor(m.w / 24);
      for (let i = 0; i < dots; i++) {
        const alpha = 0.25 + 0.3 * Math.sin(t * 2.5 + i * 1.4);
        ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(2)})`;
        ctx.fillRect(sx + 8 + i * 24, py + 5, 7, 3);
      }

      /* label above */
      ctx.save();
      ctx.shadowBlur = 6; ctx.shadowColor = m.color;
      ctx.fillStyle  = m.color;
      ctx.font = 'bold 11px "Share Tech Mono",monospace';
      ctx.textAlign = 'center';
      ctx.fillText(m.title, sx + m.w / 2, py - 18);
      ctx.fillStyle = 'rgba(180,210,255,0.55)';
      ctx.font = '9px "Share Tech Mono",monospace';
      ctx.fillText(m.company, sx + m.w / 2, py - 7);
      ctx.restore();
    }
  }

  function drawChar() {
    const sy2 = 1 - char.bounce * 0.28;
    const sx2 = 1 + char.bounce * 0.18;
    ctx.save();
    ctx.translate(toScreen(char.wx) + char.w / 2, char.wy + char.h);
    ctx.scale(sx2, sy2);
    ctx.restore();
    drawCharPixel(
      toScreen(char.wx) + char.w / 2,
      char.wy + char.h,
      char.facing, char.frame, char.jumping, 1
    );
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle   = p.color;
      ctx.beginPath(); ctx.arc(toScreen(p.wx), p.wy, 3, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  function drawCollectables() {
    const t = Date.now() / 1000;
    for (const c of COLLECTABLES) {
      const sx = toScreen(c.wx);
      if (sx < -80 || sx > W + 80) continue;

      const rgb       = hexRgb(c.color);
      const pillarTopY = gndY() - c.elevBase;

      if (c.collected) {
        /* faint ✓ at pillar top */
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = c.color;
        ctx.font = '8px "Share Tech Mono",monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✓', sx, pillarTopY - 4);
        /* dim pillar */
        ctx.strokeStyle = `rgba(${rgb},0.1)`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx, gndY()); ctx.lineTo(sx, pillarTopY); ctx.stroke();
        ctx.restore();
        continue;
      }

      const bob   = Math.sin(t * 1.8 + c.offset) * 7;
      const cy    = pillarTopY + bob;  // gem centre
      const pulse = 0.7 + 0.3 * Math.sin(t * 2.5 + c.offset);
      const rot   = t * 0.9 + c.offset;
      const r     = 12;

      /* pillar from ground to gem base */
      ctx.save();
      ctx.shadowBlur  = 4; ctx.shadowColor = c.color;
      ctx.strokeStyle = `rgba(${rgb},0.35)`;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(sx, gndY());
      ctx.lineTo(sx, pillarTopY + r);
      ctx.stroke();
      ctx.restore();

      /* outer diamond */
      ctx.save();
      ctx.translate(sx, cy);
      ctx.rotate(rot);
      ctx.shadowBlur  = 18 * pulse;
      ctx.shadowColor = c.color;
      ctx.strokeStyle = c.color;
      ctx.lineWidth   = 1.8;
      ctx.globalAlpha = 0.75 * pulse;
      ctx.fillStyle   = `rgba(${rgb},0.18)`;
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.lineTo(r * 0.65, 0);
      ctx.lineTo(0, r);  ctx.lineTo(-r * 0.65, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();

      /* bright centre dot */
      ctx.save();
      ctx.translate(sx, cy);
      ctx.globalAlpha = 0.9 * pulse;
      ctx.shadowBlur  = 10; ctx.shadowColor = c.color;
      ctx.fillStyle   = c.color;
      ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      /* label above gem */
      ctx.save();
      ctx.shadowBlur  = 5; ctx.shadowColor = c.color;
      ctx.fillStyle   = c.color;
      ctx.globalAlpha = 0.88;
      ctx.font        = 'bold 9px "Share Tech Mono",monospace';
      ctx.textAlign   = 'center';
      ctx.fillText(c.title, sx, cy - r - 10);
      ctx.fillStyle   = `rgba(${rgb},0.65)`;
      ctx.font        = '8px "Share Tech Mono",monospace';
      ctx.fillText(c.tag, sx, cy - r - 1);
      ctx.restore();
    }
  }

  function drawEndPanel() {
    const panelW = W < 480 ? 160 : (W < 760 ? 186 : 200);
    const panelH = W < 480 ? 64 : (W < 760 ? 72 : 78);
    const rightMargin = W < 480 ? 6 : 16;
    const gapAfterLastPlatform = W < 480 ? 78 : 62;
    const last = MILESTONES[MILESTONES.length - 1];
    const minLeftWx = last.wx + last.w + gapAfterLastPlatform;
    const preferredLeftWx = WORLD_W - rightMargin - panelW;
    const panelLeftWx = Math.min(Math.max(minLeftWx, preferredLeftWx), WORLD_W - panelW - 4);

    const panelCenterWx = panelLeftWx + panelW / 2;
    const sx = toScreen(panelCenterWx);
    const x = sx - panelW / 2;
    const y = gndY() - panelH - (W < 480 ? 104 : 112);

    if (x > W + 80 || x + panelW < -80) return;

    /* support pole */
    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,163,0.35)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(sx, y + panelH);
    ctx.lineTo(sx, gndY());
    ctx.stroke();
    ctx.restore();

    /* panel */
    ctx.save();
    ctx.shadowBlur = 22;
    ctx.shadowColor = '#00ffa3';
    ctx.fillStyle = 'rgba(4,10,16,0.92)';
    ctx.strokeStyle = '#00ffa3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, panelW, panelH, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    /* panel text */
    ctx.save();
    ctx.textAlign = 'center';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ffa3';
    ctx.fillStyle = '#00ffa3';
    ctx.font = `bold ${W < 480 ? 11 : (W < 760 ? 12 : 14)}px "Share Tech Mono",monospace`;
    ctx.fillText('TO BE CONTINUED...', sx, y + (W < 480 ? 28 : 31));

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(136,146,164,0.8)';
    ctx.font = `${W < 480 ? 7 : 9}px "Share Tech Mono",monospace`;
    ctx.fillText('More adventures loading', sx, y + (W < 480 ? 44 : 51));
    ctx.restore();
  }

  function drawHUD() {
    /* progress bar */
    const prog = Math.min(1, char.wx / (WORLD_W - 220));
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.roundRect(16, 13, W-32, 6, 3); ctx.fill();
    ctx.save();
    ctx.shadowBlur = 8; ctx.shadowColor = '#00ffa3';
    ctx.fillStyle  = '#00ffa3';
    ctx.beginPath(); ctx.roundRect(16, 13, (W-32)*prog, 6, 3); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(136,146,164,0.55)';
    ctx.font = '8px "Share Tech Mono",monospace';
    ctx.textAlign = 'left';  ctx.fillText('2013', 16, 12);
    ctx.textAlign = 'right'; ctx.fillText('Now',  W-16, 12);

    /* controls hint */
    if (hudAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = hudAlpha;
      ctx.fillStyle = 'rgba(0,0,0,0.52)';
      ctx.beginPath(); ctx.roundRect(W/2-150, H-46, 300, 28, 5); ctx.fill();
      ctx.fillStyle = '#8892a4';
      ctx.font = '10px "Share Tech Mono",monospace';
      ctx.textAlign = 'center';
      ctx.fillText('\u2190 \u2192 Move  \u00b7  Space / \u2191 Jump  \u00b7  Click canvas first', W/2, H-27);
      ctx.restore();
    }
  }

  /* ── INTRO SCREEN ────────────────────────────────── */
  function drawIntro() {
    const t = introAnim;

    /* background */
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#040609'); g.addColorStop(1, '#0c1020');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    /* subtle grid */
    ctx.strokeStyle = 'rgba(0,255,163,0.025)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 54) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 54) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    /* parallax stars */
    for (const s of STARS) {
      const sx = (s.wx * 0.28) % W;
      ctx.beginPath(); ctx.arc(sx, s.y * H / 280, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`; ctx.fill();
    }

    /* floating neon orbs */
    for (let i = 0; i < 5; i++) {
      const ox = W * 0.12 + i * W * 0.19 + Math.sin(t * 0.7 + i * 1.3) * 18;
      const oy = H * 0.52 + Math.cos(t * 0.5 + i * 0.9) * 16;
      const a  = 0.12 + 0.08 * Math.sin(t + i);
      ctx.beginPath(); ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,163,${a})`; ctx.fill();
    }

    /* title */
    const pulse  = 0.88 + 0.12 * Math.sin(t * 1.8);
    const tSize  = Math.max(18, Math.round(W * 0.050));
    ctx.save();
    ctx.shadowBlur = 28 * pulse; ctx.shadowColor = '#00ffa3';
    ctx.fillStyle  = '#00ffa3';
    ctx.font = `bold ${tSize}px "Share Tech Mono",monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('MY CAREER JOURNEY', W / 2, H * 0.27);
    ctx.restore();

    /* divider */
    ctx.save();
    ctx.shadowBlur  = 8; ctx.shadowColor = 'rgba(0,255,163,0.4)';
    ctx.strokeStyle = 'rgba(0,255,163,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W/2-110, H*0.32); ctx.lineTo(W/2+110, H*0.32); ctx.stroke();
    ctx.restore();

    /* subtitle lines */
    const sSize = Math.max(9, Math.round(W * 0.016));
    ctx.fillStyle = 'rgba(136,146,164,0.72)';
    ctx.font = `${sSize}px "Share Tech Mono",monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('Walk through my story as a 2D platformer', W / 2, H * 0.39);
    ctx.fillText('Land on career pillars · Collect the game gems!', W / 2, H * 0.455);

    /* idle character */
    const charY = H * 0.635 + Math.sin(t * 1.4) * 4;
    drawCharPixel(W / 2, charY, 1, 0, false, 1.5);

    /* buttons */
    const isMobileIntro = W < 560;
    const btnW = isMobileIntro ? Math.min(230, W * 0.72) : Math.min(185, W * 0.27);
    const btnH = Math.max(36, Math.round(H * 0.094));
    const gap  = isMobileIntro ? 12 : 18;
    const bx1  = isMobileIntro ? (W / 2 - btnW / 2) : (W / 2 - btnW - gap / 2);
    const bx2  = isMobileIntro ? (W / 2 - btnW / 2) : (W / 2 + gap / 2);
    const by   = isMobileIntro ? (H * 0.74) : (H * 0.775);
    const by2  = isMobileIntro ? (by + btnH + gap) : by;

    introBtns.start = { x: bx1, y: by, w: btnW, h: btnH };
    introBtns.skip  = { x: bx2, y: by2, w: btnW, h: btnH };

    /* start button */
    ctx.save();
    ctx.shadowBlur = 18 * pulse; ctx.shadowColor = '#00ffa3';
    ctx.fillStyle  = '#00ffa3';
    ctx.beginPath(); ctx.roundRect(bx1, by, btnW, btnH, 5); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#040609';
    ctx.font = `bold ${Math.round(btnH * (isMobileIntro ? 0.31 : 0.36))}px "Share Tech Mono",monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('\u25B6  Start Journey', bx1 + btnW / 2, by + btnH * 0.63);

    /* skip button */
    ctx.save();
    ctx.strokeStyle = 'rgba(136,146,164,0.35)'; ctx.lineWidth = 1.5;
    ctx.fillStyle   = 'rgba(255,255,255,0.025)';
    ctx.beginPath(); ctx.roundRect(bx2, by2, btnW, btnH, 5); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = 'rgba(136,146,164,0.6)';
    ctx.font = `${Math.round(btnH * (isMobileIntro ? 0.28 : 0.32))}px "Share Tech Mono",monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('\u2193  View Portfolio', bx2 + btnW / 2, by2 + btnH * 0.63);
  }

  /* ── CHARACTER (reusable pixel art) ─────────────── */
  function drawCharPixel(cx, cy, facing, frame, jumping, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(facing * scale, scale);

    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse(0, 3, 11, 4, 0, 0, Math.PI * 2); ctx.fill();

    const legAnim = [[0,0],[5,-3],[0,0],[-5,-3]];
    const la = jumping ? [0,0] : legAnim[frame % 4];
    ctx.fillStyle = '#1a2744';
    if (jumping) {
      ctx.fillRect(-9, -16, 8, 10); ctx.fillRect(1, -16, 8, 10);
    } else {
      ctx.fillRect(-9 + la[0], -16, 8, 16 + Math.max(0, la[1]));
      ctx.fillRect( 1 - la[0], -16, 8, 16 - Math.min(0, la[1]));
    }

    const bg = ctx.createLinearGradient(-8, -32, 9, -16);
    bg.addColorStop(0, '#00ffa3'); bg.addColorStop(1, '#00b8d9');
    ctx.fillStyle = bg; ctx.fillRect(-9, -32, 18, 16);

    ctx.fillStyle = '#00e090';
    const armSwing = jumping ? 0 : la[0] * 0.6;
    if (jumping) {
      ctx.fillRect(-14, -33, 5, 8); ctx.fillRect(9, -33, 5, 8);
    } else {
      ctx.fillRect(-14, -30 + armSwing, 5, 10);
      ctx.fillRect(  9, -30 - armSwing, 5, 10);
    }

    ctx.fillStyle = '#ffd166'; ctx.fillRect(-7, -45, 14, 13);
    ctx.fillStyle = '#221500'; ctx.fillRect(-7, -45, 14, 4);
    ctx.fillStyle = '#111';
    ctx.fillRect(-3, -39, 3, 3); ctx.fillRect(3, -39, 3, 3);
    ctx.fillStyle = '#00ffa3';
    ctx.fillRect(-2, -38, 1, 1); ctx.fillRect(4, -38, 1, 1);

    ctx.restore();
  }

  /* ── LOOP ────────────────────────────────────────── */
  let lastTs = 0;
  function loop(ts) {
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (gameState === 'intro') {
      introAnim += dt;
      drawIntro();
    } else {
      update(dt);
      drawBg();
      drawGround();
      drawPlatforms();
      drawEndPanel();
      drawCollectables();
      drawParticles();
      drawChar();
      drawHUD();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(ts => { lastTs = ts; requestAnimationFrame(loop); });

}());
