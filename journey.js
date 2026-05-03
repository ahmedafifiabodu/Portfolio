/* journey.js — 2D platformer career timeline */
(function () {
  'use strict';

  const canvas = document.getElementById('journey-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ── CONFIG ─────────────────────────────────────── */
  const WORLD_W    = 3400;
  const GRAVITY    = 1700;
  const SPEED      = 230;
  const JUMP_VEL   = -720;   /* raised: need ~152px to clear elev=120 platforms */
  const GND_RATIO  = 0.72;
  const PLT_H      = 14;     /* platform visual thickness */

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
      wx: 230, w: 160, elev: 14, color: '#00ffa3',
      title: 'IT Specialist', company: 'Elfath Group',
      period: 'Aug 2013 – Jan 2023',
      desc: 'Built websites, databases & digital environments. Ensured scalable & secure infrastructure across departments for seamless communication and data flow.',
    },
    {
      wx: 620, w: 165, elev: 52, color: '#00d4ff',
      title: 'Technical Support', company: 'Concentrix',
      period: 'Sep 2022 – Mar 2023',
      desc: 'Provided excellent customer care, resolving issues promptly with consistent follow-up. Maintained positive attitude and fostered empathy for team morale.',
    },
    {
      wx: 1050, w: 185, elev: 90, color: '#a855f7',
      title: 'Bachelor of CS', company: 'Modern Academy',
      period: 'Sep 2018 – May 2022',
      desc: 'Studied algorithms, data structures, software engineering & programming fundamentals at the Bachelor of Computer Science program.',
    },
    {
      wx: 1490, w: 185, elev: 120, color: '#f59e0b',
      title: 'Game Programming Diploma', company: 'ITI',
      period: 'Aug 2023 – Jun 2024',
      desc: 'Intensive 9-month professional diploma focused on game development, engine internals (Unity & Unreal), and game programming best practices.',
    },
    {
      wx: 1940, w: 190, elev: 80, color: '#00ffa3',
      title: 'Game Developer', company: '2024 Studios',
      period: 'Nov 2024 – Present',
      desc: 'Designing & programming engaging gameplay mechanics. Collaborating with artists to bring concepts to life and contributing to multiplayer game development. 🎮',
    },
    {
      wx: 2380, w: 195, elev: 58, color: '#ff6b9d',
      title: 'Game Developer', company: 'Futuregames Warsaw',
      period: 'Sep 2025 – Mar 2026',
      desc: 'Internship at Futuregames in Warsaw, Poland. Worked in the gaming industry on digital games, sharpening professional game dev skills in a studio environment. 🕹️',
    },
  ];

  /* ── STARS ───────────────────────────────────────── */
  const STARS = Array.from({ length: 85 }, () => ({
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
  canvas.addEventListener('click', () => canvas.focus());

  /* ── MOBILE BUTTONS ──────────────────────────────── */
  let mLeft = false, mRight = false, mJump = false;
  (function buildButtons() {
    const wrap = document.getElementById('journey-controls');
    if (!wrap) return;
    wrap.innerHTML =
      '<button id="jbL" class="game-btn">&#9664;</button>' +
      '<button id="jbJ" class="game-btn game-btn-jump">&#9650; Jump</button>' +
      '<button id="jbR" class="game-btn">&#9654;</button>';
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
  }());

  /* ── HELPERS ─────────────────────────────────────── */
  function gndY()        { return H * GND_RATIO; }
  /* platSurface = y-coordinate where character's FEET touch the platform */
  function platSurface(m){ return gndY() - m.elev; }
  function toScreen(wx)  { return wx - camX; }
  function hexRgb(h)     { return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)].join(','); }

  /* ── INFO PANEL ──────────────────────────────────── */
  const infoEl = document.getElementById('journey-info');
  let activeM = null;
  function setInfo(m) {
    if (m === activeM) return;
    activeM = m;
    if (!infoEl) return;
    if (!m) {
      infoEl.innerHTML = '<p class="journey-hint">🎮 Use <kbd>&#8592; &#8594;</kbd> to walk &nbsp;·&nbsp; <kbd>Space</kbd> or <kbd>&#8593;</kbd> to jump<br>Step on a glowing platform to explore my career!</p>';
      return;
    }
    infoEl.innerHTML = `
      <div class="jm-card" style="--mc:${m.color}">
        <div class="jm-left">
          <span class="jm-date">${m.period}</span>
          <h3 class="jm-title">${m.title}</h3>
          <span class="jm-company">${m.company}</span>
        </div>
        <p class="jm-desc">${m.desc}</p>
      </div>`;
  }
  setInfo(null);

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
    for (const m of MILESTONES) {
      const py = platSurface(m);   /* y where character feet should rest */
      if (char.vy >= 0
          && char.wy + char.h >= py
          && char.wy + char.h <= py + 26      /* generous snap window */
          && char.wx + char.w > m.wx + 2
          && char.wx < m.wx + m.w - 2) {
        if (char.jumping) { burst(char.wx + char.w/2, py, m.color); char.bounce = 0.28; char.jumping = false; }
        char.wy = py - char.h; char.vy = 0; char.onGround = true;
        stepped = m;
      }
    }
    setInfo(stepped);

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
    for (const m of MILESTONES) {
      const sx = toScreen(m.wx);
      if (sx + m.w < -30 || sx > W + 30) continue;
      const py  = platSurface(m);   /* top of platform = where feet land */
      const rgb = hexRgb(m.color);

      /* pillar — from platform bottom down to ground */
      if (m.elev > PLT_H) {
        const pillarH = m.elev - PLT_H;          /* ground to platform bottom */
        const pw = 8, px = sx + m.w/2 - 4;
        ctx.fillStyle   = `rgba(${rgb},0.10)`;
        ctx.strokeStyle = `rgba(${rgb},0.22)`; ctx.lineWidth = 1;
        ctx.fillRect(px,   py + PLT_H, pw, pillarH);
        ctx.strokeRect(px, py + PLT_H, pw, pillarH);
      }

      /* platform body — top at py, height PLT_H */
      ctx.save();
      ctx.shadowBlur = 20; ctx.shadowColor = m.color;
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

      /* label above platform */
      ctx.save();
      ctx.shadowBlur = 7; ctx.shadowColor = m.color;
      ctx.fillStyle  = m.color;
      ctx.font = 'bold 11px "Share Tech Mono",monospace';
      ctx.textAlign = 'center';
      ctx.fillText(m.title, sx + m.w/2, py - 18);
      ctx.fillStyle = 'rgba(180,210,255,0.55)';
      ctx.font = '9px "Share Tech Mono",monospace';
      ctx.fillText(m.company, sx + m.w/2, py - 7);
      ctx.restore();
    }
  }

  function drawChar() {
    const sx = toScreen(char.wx);
    const sy = char.wy;
    const f  = char.frame;
    const sy2 = 1 - char.bounce * 0.28;
    const sx2 = 1 + char.bounce * 0.18;

    ctx.save();
    /* origin = centre-bottom of character (feet level) */
    ctx.translate(sx + char.w / 2, sy + char.h);
    ctx.scale(char.facing * sx2, sy2);

    /* shadow under feet */
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse(0, 3, 11, 4, 0, 0, Math.PI * 2); ctx.fill();

    /* legs — from y=0 upward 16px */
    const legAnim = [[0,0],[5,-3],[0,0],[-5,-3]];
    const la = char.jumping ? [0,0] : legAnim[f % 4];
    ctx.fillStyle = '#1a2744';
    if (char.jumping) {
      ctx.fillRect(-9, -16, 8, 10); ctx.fillRect(1, -16, 8, 10);
    } else {
      ctx.fillRect(-9 + la[0], -16, 8, 16 + Math.max(0,  la[1]));
      ctx.fillRect( 1 - la[0], -16, 8, 16 - Math.min(0, la[1]));
    }

    /* body — y=-16 to y=-32 */
    const bg = ctx.createLinearGradient(-8, -32, 9, -16);
    bg.addColorStop(0, '#00ffa3'); bg.addColorStop(1, '#00b8d9');
    ctx.fillStyle = bg; ctx.fillRect(-9, -32, 18, 16);

    /* arms */
    ctx.fillStyle = '#00e090';
    const armSwing = char.jumping ? 0 : la[0] * 0.6;
    if (char.jumping) {
      ctx.fillRect(-14, -33, 5, 8); ctx.fillRect(9, -33, 5, 8);
    } else {
      ctx.fillRect(-14, -30 + armSwing, 5, 10);
      ctx.fillRect(  9, -30 - armSwing, 5, 10);
    }

    /* head — y=-32 to y=-45 */
    ctx.fillStyle = '#ffd166'; ctx.fillRect(-7, -45, 14, 13);

    /* hair */
    ctx.fillStyle = '#221500'; ctx.fillRect(-7, -45, 14, 4);

    /* eyes */
    ctx.fillStyle = '#111';
    ctx.fillRect(-3, -39, 3, 3); ctx.fillRect(3, -39, 3, 3);
    ctx.fillStyle = '#00ffa3';
    ctx.fillRect(-2, -38, 1, 1); ctx.fillRect(4, -38, 1, 1);

    ctx.restore();
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

  /* ── LOOP ────────────────────────────────────────── */
  let lastTs = 0;
  function loop(ts) {
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;
    update(dt);
    drawBg();
    drawGround();
    drawPlatforms();
    drawParticles();
    drawChar();
    drawHUD();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(ts => { lastTs = ts; requestAnimationFrame(loop); });

}());
