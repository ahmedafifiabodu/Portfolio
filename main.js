/* ============================================
   PARTICLE CANVAS BACKGROUND
   ============================================ */
const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');

let W, H, particles = [];

const COLORS = ['#00ffa3', '#00d4ff', '#a855f7'];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createParticle() {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.3,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    color: randomColor(),
    alpha: Math.random() * 0.6 + 0.2,
  };
}

for (let i = 0; i < 120; i++) particles.push(createParticle());

function drawParticles() {
  ctx.clearRect(0, 0, W, H);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > W) p.dx *= -1;
    if (p.y < 0 || p.y > H) p.dy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.fill();
  }

  /* draw connecting lines between nearby particles */
  ctx.globalAlpha = 1;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = particles[i].color;
        ctx.globalAlpha = (1 - dist / 100) * 0.15;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ============================================
   NAVBAR — shrink on scroll + active link
   ============================================ */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

/* ============================================
   SECTION SCROLL FADE IN/OUT
   ============================================ */
if ('IntersectionObserver' in window) {
  window.addEventListener('load', () => {
    // Skip fade entirely when user prefers reduced motion (e.g. Opera GX Battery Saver)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ROOT_MARGIN_RATIO = 0.08; // matches '-8% 0px -8% 0px'

    // For sections taller than the viewport, intersectionRatio approaches 0
    // even when the section fills the screen. Use viewport-coverage ratio instead.
    function getEffectiveRatio(entry) {
      const rootH = (entry.rootBounds || { height: window.innerHeight }).height;
      const elemH = entry.boundingClientRect.height;
      const intersectH = entry.intersectionRect.height;
      if (elemH > rootH) {
        return intersectH / rootH;
      }
      return entry.intersectionRatio;
    }

    function applyVisibility(section, ratio) {
      const visibility = Math.max(0.25, Math.min(1, ratio * 1.45));
      section.style.setProperty('--section-visibility', visibility.toFixed(3));
      section.classList.toggle('is-active', ratio >= 0.5);
    }

    const sectionFadeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        applyVisibility(entry.target, getEffectiveRatio(entry));
      });
    }, {
      threshold: Array.from({ length: 21 }, (_, i) => i / 20),
      rootMargin: '-8% 0px -8% 0px'
    });

    sections.forEach((section) => {
      section.classList.add('section-fade');
      section.style.setProperty('--section-visibility', '0.25');
      sectionFadeObserver.observe(section);
    });

    // Re-evaluate visibility when a section resizes (e.g. journey section grows
    // as the player collects gems and more game cards are added to the DOM).
    if ('ResizeObserver' in window) {
      const sectionResizeObserver = new ResizeObserver(() => {
        const vpH = window.innerHeight;
        const margin = vpH * ROOT_MARGIN_RATIO;
        const rootTop    = margin;
        const rootBottom = vpH - margin;
        const rootH      = rootBottom - rootTop;

        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const intersectTop    = Math.max(rect.top,    rootTop);
          const intersectBottom = Math.min(rect.bottom, rootBottom);
          const intersectH      = Math.max(0, intersectBottom - intersectTop);
          const elemH           = rect.height;

          const ratio = elemH > rootH
            ? intersectH / rootH
            : (elemH > 0 ? intersectH / elemH : 0);

          applyVisibility(section, ratio);
        });
      });

      sections.forEach((section) => sectionResizeObserver.observe(section));
    }
  });
}

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  highlightNav();
});

function highlightNav() {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

/* ============================================
   HAMBURGER MENU
   ============================================ */
const hamburger = document.getElementById('hamburger');
const navList   = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navList.classList.toggle('open');
});

navLinks.forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navList.classList.remove('open');
  });
});

/* Force correct scroll for any anchor btn pointing to #games or #journey */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = document.getElementById('navbar')?.offsetHeight || 70;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================
   TYPEWRITER EFFECT
   ============================================ */
const lines = [
  'Game Programmer',
  'Unity Developer',
  'Unreal Developer',
  'C# / C++ Coder',
  'VR / XR Builder',
];

let lineIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typed-text');

function type() {
  const current = lines[lineIdx];

  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting  = false;
      lineIdx   = (lineIdx + 1) % lines.length;
    }
  }
  setTimeout(type, deleting ? 50 : 90);
}
type();

/* ============================================
   SKILL BAR BUILDER & INTERSECTION OBSERVER
   ============================================ */
document.querySelectorAll('.skill-bar').forEach(bar => {
  const inner = document.createElement('div');
  inner.className = 'skill-bar-inner';
  const fill = document.createElement('div');
  fill.className = 'skill-bar-fill';
  fill.dataset.target = bar.dataset.percent;
  inner.appendChild(fill);
  bar.appendChild(inner);
});

/* ============================================
   GENERIC INTERSECTION OBSERVER
   ============================================ */
const observerOptions = { threshold: 0.15 };

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
document.querySelectorAll('.pub-card').forEach(el => revealObserver.observe(el));

/* skill bar fill observer */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-bar-fill').forEach(fill => {
        fill.style.width = fill.dataset.target + '%';
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-bar-wrap').forEach(el => skillObserver.observe(el));

/* ============================================
   EMAILJS INIT
   ============================================ */
(function () {
  emailjs.init({ publicKey: 'RLn_TcjC2tV27ThX-' });
})();

/* ============================================
   CONTACT FORM
   ============================================ */
function handleFormSubmit(e) {
  e.preventDefault();
  const fb  = document.getElementById('form-feedback');
  const btn = e.target.querySelector('button[type="submit"]');

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  btn.textContent = 'Sending...';
  btn.disabled = true;

  emailjs.send('service_7mkpu6h', 'template_dns3a2u', {
    title:   `Portfolio Contact from ${name}`,
    name:    name,
    email:   email,
    message: message,
  }).then(() => {
    fb.style.color = '#00ffa3';
    fb.textContent = '✅ Message sent! A confirmation was emailed to you — check your spam/junk if you don\'t see it.';
    e.target.reset();
    btn.textContent = 'Send Message 🚀';
    btn.disabled = false;
    setTimeout(() => (fb.textContent = ''), 6000);
  }).catch((err) => {
    console.error('EmailJS error:', err);
    fb.style.color = '#fa5c5c';
    fb.textContent = '❌ Something went wrong. Please try again or email me directly.';
    btn.textContent = 'Send Message 🚀';
    btn.disabled = false;
  });
}

/* ============================================
   RESUME PDF DOWNLOAD
   ============================================ */
async function loadImageAsDataUrl(url) {
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) throw new Error('Image request failed');
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function loadFirstAvailableImage(urls) {
  for (const url of urls) {
    try {
      return await loadImageAsDataUrl(url);
    } catch (err) {
      // try next URL
    }
  }
  throw new Error('No profile image source available');
}

function applyRoundedCorners(dataUrl, size, radius) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, size, size, radius);
    } else {
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
    }
    ctx.clip();
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function ensureJsPdf() {
  if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    // Try local copy first; CDN is fallback only
    s.src = 'assets/libs/jspdf.umd.min.js';
    s.onload = resolve;
    s.onerror = () => {
      // Local failed — try CDN as last resort
      const s2 = document.createElement('script');
      s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s2.onload = resolve;
      s2.onerror = () => reject(new Error('Failed to load PDF library'));
      document.head.appendChild(s2);
    };
    document.head.appendChild(s);
  });
}

async function downloadResumePdf() {
  const btn = document.getElementById('download-resume-btn');
  const originalText = btn ? btn.textContent : '';
  if (btn) { btn.textContent = 'Generating…'; btn.disabled = true; }

  try {
    await ensureJsPdf();
    const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentW = pageW - margin * 2;

  const C = {
    bg: [255, 255, 255],
    header: [12, 18, 34],
    accent: [0, 178, 136],
    text: [30, 35, 45],
    muted: [92, 102, 118],
    chip: [236, 244, 246]
  };

  function setColor(rgb) {
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  }

  function drawWrapped(text, x, y, maxWidth, opts = {}) {
    const size = opts.size || 10;
    const style = opts.style || 'normal';
    const color = opts.color || C.text;
    const lineGap = opts.lineGap || 14;

    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    setColor(color);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineGap;
  }

  function drawLink(label, url, x, y, maxWidth, opts = {}) {
    const color = opts.color || [28, 96, 184];
    const style = opts.style || 'normal';
    const size = opts.size || 10;

    doc.setFont('helvetica', 'normal');
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    setColor(color);
    const lines = doc.splitTextToSize(label, maxWidth);
    doc.text(lines, x, y);

    let lineY = y;
    lines.forEach((line) => {
      const width = doc.getTextWidth(line);
      doc.link(x, lineY - 9, width, 12, { url });
      lineY += 14;
    });

    return y + lines.length * 14;
  }

  let y = margin;

  doc.setFillColor(C.header[0], C.header[1], C.header[2]);
  doc.roundedRect(margin, y, contentW, 138, 14, 14, 'F');

  setColor([255, 255, 255]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text('Ahmed Afifi', margin + 22, y + 40);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  setColor(C.accent);
  doc.text('Game Programmer', margin + 22, y + 63);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setColor([220, 228, 238]);
  doc.text('Nasr City, Cairo, Egypt', margin + 22, y + 84);
  doc.text('Email: aafifi1988@icloud.com  |  Phone: +2010-900-23274', margin + 22, y + 100);
  setColor(C.accent);
  doc.text('GitHub:', margin + 22, y + 116);
  drawLink('github.com/ahmedafifiabodu', 'https://github.com/ahmedafifiabodu', margin + 68, y + 116, 220, {
    color: [220, 228, 238],
    size: 10
  });
  setColor(C.accent);
  doc.text('LinkedIn:', margin + 22, y + 130);
  drawLink('linkedin.com/in/ahmedafifiabdou', 'https://www.linkedin.com/in/ahmedafifiabdou/', margin + 76, y + 130, 250, {
    color: [220, 228, 238],
    size: 10
  });

  const photoSize = 84;
  const photoX = margin + contentW - photoSize - 20;
  const photoY = y + 26;
  doc.setDrawColor(C.accent[0], C.accent[1], C.accent[2]);
  doc.setLineWidth(2);
  doc.roundedRect(photoX - 3, photoY - 3, photoSize + 6, photoSize + 6, 12, 12, 'S');

  try {
    const photoDataUrl = await loadFirstAvailableImage([
      'https://avatars.githubusercontent.com/ahmedafifiabodu?s=400',
      'https://github.com/ahmedafifiabodu.png?size=400',
      'https://unavatar.io/github/ahmedafifiabodu'
    ]);
    const clippedPhoto = await applyRoundedCorners(photoDataUrl, 252, 30);
    doc.addImage(clippedPhoto, 'PNG', photoX, photoY, photoSize, photoSize);
  } catch (err) {
    doc.setFillColor(32, 40, 58);
    doc.roundedRect(photoX, photoY, photoSize, photoSize, 10, 10, 'F');
    setColor([255, 255, 255]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('AA', photoX + 22, photoY + 50);
  }

  y += 162;

  function section(title, lines) {
    const minHeight = 32 + lines.length * 15;
    if (y + minHeight > pageH - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(C.chip[0], C.chip[1], C.chip[2]);
    doc.roundedRect(margin, y, contentW, 22, 6, 6, 'F');
    doc.setFillColor(C.accent[0], C.accent[1], C.accent[2]);
    doc.rect(margin, y, 4, 22, 'F');

    setColor(C.header);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title, margin + 12, y + 15);
    y += 34;

    let lastContext = 'normal';
    lines.forEach((line) => {
      const itemLine = line.startsWith('item:');
      const itemLinkLine = line.startsWith('itemlink:');
      const listItemLine = line.startsWith('listitem:');
      const metaLine = line.startsWith('meta:');
      const detailLine = line.startsWith('detail:');
      const linkLine = line.startsWith('link:');

      if (linkLine) {
        const payload = line.slice(5);
        const sep = payload.indexOf('|');
        const label = sep >= 0 ? payload.slice(0, sep).trim() : payload.trim();
        const url = sep >= 0 ? payload.slice(sep + 1).trim() : payload.trim();
        const linkX = lastContext === 'normal' ? margin : margin + 22;
        const linkW = lastContext === 'normal' ? contentW : contentW - 22;
        y = drawLink('Link: ' + label, url, linkX, y, linkW);
        lastContext = 'link';
      } else if (itemLinkLine) {
        const payload = line.slice(9);
        const sep = payload.indexOf('|');
        const label = sep >= 0 ? payload.slice(0, sep).trim() : payload.trim();
        const url = sep >= 0 ? payload.slice(sep + 1).trim() : payload.trim();
        setColor(C.accent);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('•', margin + 12, y);
        y = drawLink(label, url, margin + 24, y, contentW - 24, {
          color: C.header,
          style: 'bold',
          size: 11
        });
        lastContext = 'item';
      } else if (itemLine) {
        const text = line.slice(5).trim();
        setColor(C.accent);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('•', margin + 12, y);
        y = drawWrapped(text, margin + 24, y, contentW - 24, {
          size: 11,
          style: 'bold',
          color: C.header,
          lineGap: 14
        });
        lastContext = 'item';
      } else if (listItemLine) {
        const text = line.slice(9).trim();
        setColor(C.accent);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('•', margin + 12, y);
        y = drawWrapped(text, margin + 24, y, contentW - 24, {
          size: 10,
          style: 'normal',
          color: C.text,
          lineGap: 13
        });
        lastContext = 'item';
      } else if (metaLine) {
        y = drawWrapped(line.slice(5).trim(), margin + 18, y, contentW - 18, {
          size: 9,
          style: 'italic',
          color: C.muted,
          lineGap: 12
        });
        lastContext = 'meta';
      } else if (detailLine) {
        const text = line.slice(7).trim();
        y = drawWrapped(text, margin + 30, y, contentW - 30, { size: 9.2, color: C.text, lineGap: 12 });
        lastContext = 'detail';
      } else {
        y = drawWrapped(line, margin, y, contentW, { size: 10, color: C.text, lineGap: 14 });
        lastContext = 'normal';
      }
      y += lastContext === 'item' ? 2 : (lastContext === 'meta' ? 1 : 3);
    });

    y += 14;
  }

  section('Summary', [
    'detail:Professional game programmer with experience in regulated and corporate environments.',
    'detail:Builds gameplay systems, solves production issues, and collaborates with artists to deliver immersive interactive experiences.'
  ]);

  section('Experience', [
    'item:Game Developer - 2024 Studios (Full-time)',
    'meta:Nov 2024 - Present | Egypt | Hybrid',
    'detail:Responsible for creating immersive and engaging gaming experiences that captivate players.',
    'detail:Designing and programming gameplay mechanics and supporting production delivery.',
    'detail:Tech stack focus: Unity, gameplay systems, and collaborative game development workflows.',
    'item:Game Developer - Futuregames Warsaw (Internship)',
    'meta:Sep 2025 - Mar 2026 | Poland | Hybrid',
    'detail:Developed gameplay systems and interactive features using Unity and C# while improving performance and debugging workflows.',
    'item:Game Developer - Information Technology Institute (ITI) (Internship)',
    'meta:Oct 2023 - Jun 2024 | Egypt | Hybrid',
    'detail:Contributed to game programming projects across C++, C#, Unity, and production-style teamwork.',
    'item:Customer Service Representative - Concentrix (Full-time)',
    'meta:Sep 2022 - Mar 2023 | Cairo, Egypt | On-site',
    'detail:Delivered customer support and issue resolution while maintaining strong communication and satisfaction standards.',
    'item:IT Specialist - Elfath Group (Self-employed)',
    'meta:Aug 2013 - Jan 2023 | Cairo, Egypt',
    'detail:Built and maintained digital systems supporting business operations, communication, and team efficiency.'
  ]);

  section('Education', [
    'item:Modern Academy Maadi',
    'meta:Bachelor of Science - BS, Computer Science | 2018 - 2022',
    'item:Cambridge Egypt',
    'meta:Sep 2010 - Jul 2018'
  ]);

  section('Published Games/Apps', [
    'itemlink:Prime Press|https://play.google.com/store/apps/details?id=com.PrimePress.PrimePressEKit&hl=en',
    'detail:Interactive educational platform with digital coursebooks, multimedia learning resources, and classroom management tools.',
    'itemlink:Voita|https://futuregames.itch.io/voita',
    'detail:Turn-based sci-fi predator game where players set traps, drag bodies, and evolve powers.',
    'itemlink:Project Trash|https://futuregames.itch.io/projecttrash',
    'detail:Fast-paced recycling simulation focused on sorting accuracy under pressure.',
    'itemlink:Parasozhyt|https://gamekernel.itch.io/parasozhyt',
    'detail:Body-hopping shooter where survival requires quick host switching and tactical play.',
    'itemlink:Vampire Survival|https://ahmedafifiabodu.itch.io/vampire-survival',
    'detail:Top-down survival game built around wave escalation and power growth.',
    'itemlink:Dawn of the Last Seeds|https://nourhan-taman.itch.io/dawn-of-the-last-seeds',
    'detail:Post-apocalyptic puzzle title focused on preserving the last seeds of humanity.',
    'itemlink:The Kitten and The Hidden|https://nayrayehya.itch.io/the-kitten-and-the-hidden',
    'detail:Story-driven puzzle exploration about a ghost and a persistent cat companion.',
    'itemlink:Forest of the Wicked|https://gothmothdev.itch.io/forest-of-the-wicked',
    'detail:Dark atmospheric horror-adventure game jam entry.',
    'itemlink:Righteous Crane|https://mohamed-elkholy.itch.io/righteous-crane',
    'detail:Puzzle/adventure title where the crane solves the land’s problems.'
  ]);

  section('Published Tools', [
    'itemlink:Configurable Autosave - Unity Asset Store|https://assetstore.unity.com/packages/tools/utilities/configurable-autosave-313115',
    'detail:Free Unity 6 editor extension that autosaves work on user-defined rules. Built with UI Toolkit; supports Built-in, URP and HDRP.'
  ]);

  section('In Development - 2024 Studios', [
    'itemlink:Tales of Khayaal|https://www.talesofkhayaal.com',
    'detail:Narrative action-adventure. Gameplay systems work: ability/attribute framework, combat with a custom in-editor attack authoring tool, traversal, crowds, and a quest system.',
    'item:Project Clash',
    'detail:Multiplayer VR card battler - lane-based unit deployment and tower combat with networked matches, voice chat, and spectator support.',
    'item:Puzzle Escape Room',
    'detail:Co-op multiplayer puzzle horror set in a derelict hospital; code terminals, key-locked doors, and networked interaction built on Unity 6 and Netcode for GameObjects.'
  ]);

  section('Certifications', [
    'listitem:Diploma in Game Programming - ITI (Issued Jun 2024)',
    'listitem:2024 NASA Space Apps Challenge - NASA (Issued Oct 2024)',
    'listitem:ACT 1: Rational Game Design - Ubisoft (Credential ID 106197-00002-08651)',
    'listitem:ACT 2: Rational Game Design - Ubisoft (Credential ID 106197-00010-08672)'
  ]);

  section('Skills', [
    'listitem:Engines: Unity, Unreal Engine',
    'listitem:Programming Languages: C#, C++, Python, JavaScript, Java',
    'listitem:Specializations: Gameplay Mechanics, VR/XR, Narrative Design, AI and Combat Systems, Multiplayer, Code Architecture',
    'listitem:Soft Skills: Problem Solving, Teamwork, Time Management, Communication, Adaptability',
    'listitem:Languages: English, Arabic'
  ]);

  setColor(C.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Generated from ahmedafifiabodu portfolio', margin, pageH - 18);

  doc.save('Ahmed-Afifi-Resume.pdf');
  } catch (err) {
    console.error('PDF generation failed:', err);
    alert('Could not generate the PDF. Please check your connection and try again.');
  } finally {
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
  }
}

document.getElementById('download-resume-btn')?.addEventListener('click', downloadResumePdf);

/* ============================================
   GAME LIGHTBOX MODAL
   ============================================ */
const GAMES_DATA = {
  '01': {
    screenshots: [
      'https://image-eo.winudf.com/v2/image1/Y29tLlByaW1lUHJlc3MuUHJpbWVQcmVzc0VLaXRfc2NyZWVuXzBfMTc1NzgzMjM4NV8wNTc/screen-0.webp?fakeurl=1&type=.webp',
      'https://image-eo.winudf.com/v2/image1/Y29tLlByaW1lUHJlc3MuUHJpbWVQcmVzc0VLaXRfc2NyZWVuXzFfMTc1NzgzMjM4Nl8wNzc/screen-1.webp?fakeurl=1&type=.webp',
      'https://image-eo.winudf.com/v2/image1/Y29tLlByaW1lUHJlc3MuUHJpbWVQcmVzc0VLaXRfc2NyZWVuXzJfMTc1NzgzMjM4N18wMTg/screen-2.webp?fakeurl=1&type=.webp',
      'https://image-eo.winudf.com/v2/image1/Y29tLlByaW1lUHJlc3MuUHJpbWVQcmVzc0VLaXRfc2NyZWVuXzNfMTc1NzgzMjM4OF8wMDY/screen-3.webp?fakeurl=1&type=.webp',
      'https://image-eo.winudf.com/v2/image1/Y29tLlByaW1lUHJlc3MuUHJpbWVQcmVzc0VLaXRfc2NyZWVuXzRfMTc1NzgzMjM4OV8wOTQ/screen-4.webp?fakeurl=1&type=.webp',
      'https://image-eo.winudf.com/v2/image1/Y29tLlByaW1lUHJlc3MuUHJpbWVQcmVzc0VLaXRfc2NyZWVuXzVfMTc1NzgzMjM5MV8wNDM/screen-5.webp?fakeurl=1&type=.webp',
      'https://image-eo.winudf.com/v2/image1/Y29tLlByaW1lUHJlc3MuUHJpbWVQcmVzc0VLaXRfc2NyZWVuXzZfMTc1NzgzMjM5MV8wODk/screen-6.webp?fakeurl=1&type=.webp',
      'https://image-eo.winudf.com/v2/image1/Y29tLlByaW1lUHJlc3MuUHJpbWVQcmVzc0VLaXRfc2NyZWVuXzdfMTc1NzgzMjM5Ml8wNDk/screen-7.webp?fakeurl=1&type=.webp'
    ]
  },
  '02': {
    screenshots: [
      'https://assetstorev1-prd-cdn.unity3d.com/key-image/e41cc31e-81fd-4746-b854-8de5867b79ba.jpg'
    ]
  },
  '03': {
    screenshots: [
      'https://img.itch.zone/aW1nLzI1Njk2NTA2LmpwZw==/original/KtMHYj.jpg',
      'https://img.itch.zone/aW1hZ2UvNDI4NDUxOC8yNTY2MzczMS5wbmc=/original/X6K9Zg.png',
      'https://img.itch.zone/aW1hZ2UvNDI4NDUxOC8yNTY2MzczMi5wbmc=/original/RgCQOb.png',
      'https://img.itch.zone/aW1hZ2UvNDI4NDUxOC8yNTY2MzczMC5wbmc=/original/ijt6g3.png',
      'https://img.itch.zone/aW1hZ2UvNDI4NDUxOC8yNTY2MzczMy5wbmc=/original/BPAw7n.png'
    ]
  },
  '04': {
    screenshots: [
      'https://img.itch.zone/aW1nLzI0Mjg4OTM1LnBuZw==/original/fH3JnI.png',
      'https://img.itch.zone/aW1hZ2UvNDA3NDc3MS8yNDI4ODk2Ny5wbmc=/original/3Nxzso.png',
      'https://img.itch.zone/aW1hZ2UvNDA3NDc3MS8yNDI4ODk3MS5wbmc=/original/4iakFT.png',
      'https://img.itch.zone/aW1hZ2UvNDA3NDc3MS8yNDI4ODk0OC5wbmc=/original/3w4Td2.png',
      'https://img.itch.zone/aW1hZ2UvNDA3NDc3MS8yNDI4ODk5MC5wbmc=/original/%2FYorlO.png'
    ]
  },
  '05': {
    screenshots: [
      'https://img.itch.zone/aW1nLzIzNzU3OTkwLmpwZw==/original/nfW7g5.jpg',
      'https://img.itch.zone/aW1hZ2UvMzk3NzQ2Ny8yMzc1Nzk5NS5wbmc=/original/6lzvZj.png',
      'https://img.itch.zone/aW1hZ2UvMzk3NzQ2Ny8yMzc1Nzk5My5wbmc=/original/qgly6U.png',
      'https://img.itch.zone/aW1hZ2UvMzk3NzQ2Ny8yMzc1Nzk5NC5wbmc=/original/f4jVaE.png'
    ]
  },
  '06': {
    screenshots: [
      'https://img.itch.zone/aW1nLzIzNjcxNzY0LnBuZw==/original/JUaJTr.png',
      'https://img.itch.zone/aW1hZ2UvMzk2OTQyOC8yMzY3MTgxMC5wbmc=/original/LmzrEr.png',
      'https://img.itch.zone/aW1hZ2UvMzk2OTQyOC8yMzY3MTgxMy5wbmc=/original/8NzCza.png',
      'https://img.itch.zone/aW1hZ2UvMzk2OTQyOC8yMzY3MTgxNi5wbmc=/original/6867VU.png',
      'https://img.itch.zone/aW1hZ2UvMzk2OTQyOC8yMzY3MTgxOC5wbmc=/original/s%2FqIx6.png'
    ]
  },
  '07': {
    screenshots: [
      'https://img.itch.zone/aW1nLzE1MjUyNTcxLnBuZw==/original/13QBvi.png'
    ]
  },
  '08': {
    screenshots: [
      'https://img.itch.zone/aW1nLzE2OTgyNTI1LnBuZw==/original/glyJIm.png'
    ]
  },
  '09': {
    screenshots: [
      'https://img.itch.zone/aW1nLzIzNjQ5MzEyLnBuZw==/original/3XCMBk.png',
      'https://img.itch.zone/aW1nLzIzNjQ4NDk0LnBuZw==/original/%2BtuFWR.png'
    ]
  },
  '10': {
    screenshots: [
      'https://img.itch.zone/aW1nLzE1MjgxNjM1LnBuZw==/original/lO3Zf5.png'
    ]
  },
  /* In-development work — placeholder key art until captures land. */
  '11': {
    screenshots: [
      'assets/covers/tales-of-khayaal.png'
    ]
  },
  '12': {
    screenshots: [
      'assets/covers/project-clash.png'
    ]
  },
  '13': {
    screenshots: [
      'assets/covers/puzzle-escape-room.png'
    ]
  }
};

function xmlEscape(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createProjectPosterDataUrl(title, tags, palette) {
  const [a, b] = palette || ['#1f2937', '#111827'];
  const safeTitle = xmlEscape(title);
  const safeTags = xmlEscape((tags || []).slice(0, 3).join(' • '));
  const initials = xmlEscape(title.split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase());

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${a}" />
          <stop offset="100%" stop-color="${b}" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#g)" />
      <circle cx="180" cy="120" r="210" fill="rgba(0,255,163,0.10)" />
      <circle cx="1120" cy="620" r="260" fill="rgba(0,212,255,0.12)" />
      <text x="90" y="300" fill="rgba(255,255,255,0.16)" font-size="220" font-family="Orbitron, Arial, sans-serif" font-weight="700">${initials}</text>
      <text x="90" y="530" fill="#e2e8f0" font-size="58" font-family="Rajdhani, Arial, sans-serif" font-weight="700">${safeTitle}</text>
      <text x="90" y="590" fill="rgba(226,232,240,0.82)" font-size="28" font-family="Share Tech Mono, monospace">${safeTags}</text>
      <rect x="90" y="620" width="290" height="42" rx="12" fill="rgba(0,255,163,0.18)" stroke="rgba(0,255,163,0.45)" />
      <text x="115" y="648" fill="#00ffa3" font-size="20" font-family="Share Tech Mono, monospace">PROJECT PREVIEW</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createCertificatePosterDataUrl(title, issuer, date, icon) {
  const safeTitle = xmlEscape(title);
  const safeIssuer = xmlEscape(issuer || 'Issuer');
  const safeDate = xmlEscape(date || 'Issued');
  const safeIcon = xmlEscape(icon || '🏅');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#g)" />
      <rect x="76" y="72" width="1128" height="576" rx="30" fill="rgba(0,0,0,0.22)" stroke="rgba(0,255,163,0.35)" stroke-width="2" />
      <text x="126" y="186" fill="#00ffa3" font-size="72" font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji">${safeIcon}</text>
      <text x="208" y="184" fill="#e2e8f0" font-size="58" font-family="Rajdhani, Arial, sans-serif" font-weight="700">${safeTitle}</text>
      <text x="126" y="278" fill="#00d4ff" font-size="36" font-family="Rajdhani, Arial, sans-serif">${safeIssuer}</text>
      <text x="126" y="336" fill="rgba(226,232,240,0.78)" font-size="30" font-family="Share Tech Mono, monospace">${safeDate}</text>
      <rect x="126" y="412" width="380" height="52" rx="12" fill="rgba(0,255,163,0.16)" stroke="rgba(0,255,163,0.45)" />
      <text x="154" y="447" fill="#00ffa3" font-size="24" font-family="Share Tech Mono, monospace">Certificate Preview</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

(function () {
  const overlay = document.getElementById('game-modal-overlay');
  if (!overlay) return;

  const modalGallery  = overlay.querySelector('.modal-gallery');
  const galleryImgs   = overlay.querySelector('.gallery-imgs');
  const dotsArea      = overlay.querySelector('.gallery-dots');
  const counterEl     = overlay.querySelector('.gallery-counter');
  const fsExitBtn     = overlay.querySelector('.gallery-fs-exit');
  const prevBtn       = overlay.querySelector('.gallery-arrow.prev');
  const nextBtn       = overlay.querySelector('.gallery-arrow.next');
  const modalTitle    = overlay.querySelector('.modal-title');
  const modalDesc     = overlay.querySelector('.modal-desc');
  const modalTags     = overlay.querySelector('.modal-tags');
  const modalActions  = overlay.querySelector('.modal-actions');

  let currentIndex = 0;
  let totalScreenshots = 0;
  let fsUiTimer = null;

  function clearFullscreenUiTimer() {
    if (!fsUiTimer) return;
    clearTimeout(fsUiTimer);
    fsUiTimer = null;
  }

  function isGalleryFullscreen() {
    return document.fullscreenElement === modalGallery;
  }

  function scheduleFullscreenUiFade() {
    clearFullscreenUiTimer();
    if (!isGalleryFullscreen()) return;
    fsUiTimer = setTimeout(() => {
      modalGallery.classList.add('fs-ui-hidden');
    }, 1000);
  }

  function showFullscreenUi() {
    modalGallery.classList.remove('fs-ui-hidden');
    scheduleFullscreenUiFade();
  }

  function toggleActiveScreenshotFullscreen() {
    if (document.fullscreenElement === modalGallery) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    if (!document.fullscreenElement) {
      modalGallery.requestFullscreen?.().catch(() => {});
    }
  }

  function goTo(idx) {
    if (totalScreenshots <= 1) return;
    currentIndex = (idx + totalScreenshots) % totalScreenshots;
    updateGallery();
    showFullscreenUi();
  }

  function updateGallery() {
    galleryImgs.querySelectorAll('.modal-gallery-img').forEach((img, i) => {
      img.classList.toggle('active', i === currentIndex);
    });
    dotsArea.querySelectorAll('.gallery-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
    counterEl.textContent = totalScreenshots > 1 ? `${currentIndex + 1} / ${totalScreenshots}` : '';
  }

  function openModalContent({ title, description, tags, actions, screenshots, fallbackImage }) {
    const shots = screenshots || [];
    if (!shots.length) return;

    totalScreenshots = shots.length;
    currentIndex = 0;

    // Title & description
    modalTitle.textContent = title;
    modalDesc.textContent = description;

    // Tags
    modalTags.innerHTML = '';
    tags.forEach(tag => {
      const s = document.createElement('span');
      s.textContent = tag;
      modalTags.appendChild(s);
    });

    // Action buttons
    modalActions.innerHTML = '';
    actions.forEach(action => {
      const a = document.createElement('a');
      a.href = action.href;
      a.target = '_blank';
      a.setAttribute('rel', 'noopener noreferrer');
      a.className = action.className;
      a.textContent = action.label;
      modalActions.appendChild(a);
    });

    // Build screenshot images
    galleryImgs.innerHTML = '';
    dotsArea.innerHTML = '';
    shots.forEach((src, i) => {
      const img = document.createElement('img');
      img.src     = src;
      img.alt     = `Screenshot ${i + 1}`;
      img.className = 'modal-gallery-img' + (i === 0 ? ' active' : '');
      img.loading = 'lazy';
      img.addEventListener('error', () => {
        img.src = fallbackImage || createProjectPosterDataUrl(title, tags, ['#1f2937', '#111827']);
      }, { once: true });
      galleryImgs.appendChild(img);

      const dot = document.createElement('div');
      dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsArea.appendChild(dot);
    });

    modalGallery.classList.toggle('single', totalScreenshots <= 1);
    counterEl.textContent = totalScreenshots > 1 ? `1 / ${totalScreenshots}` : '';

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function openPublishedGameModal(card) {
    const num = card.querySelector('.pub-number').textContent.trim();
    const data = GAMES_DATA[num];
    if (!data) return;

    openModalContent({
      title: card.querySelector('h3').textContent.trim(),
      description: card.querySelector('.pub-desc').textContent.trim(),
      tags: Array.from(card.querySelectorAll('.pub-tags span')).map(t => t.textContent.trim()),
      actions: Array.from(card.querySelectorAll('.pub-btn')).map(btn => ({
        href: btn.href,
        label: btn.textContent.trim(),
        className: btn.className
      })),
      screenshots: data.screenshots
    });
  }

  function openCertificateModal(card) {
    const title = card.querySelector('h3')?.textContent.trim() || 'Certificate';
    const issuer = card.querySelector('h4')?.textContent.trim() || 'Issuer';
    const date = card.querySelector('.cert-date')?.textContent.trim() || '';
    const credentialId = card.querySelector('.cert-id')?.textContent.trim() || '';
    const skills = card.querySelector('.cert-skills')?.textContent.replace(/\u00a0/g, ' ').trim() || '';
    const icon = card.querySelector('.cert-icon')?.textContent.trim() || '🏅';
    const certImage = (card.dataset.certImage || '').trim();
    const fallbackPoster = createCertificatePosterDataUrl(title, issuer, date, icon);

    const actions = [];
    const tags = [issuer, date, credentialId].filter(Boolean);
    const descriptionParts = [];
    if (skills) descriptionParts.push(`Skills: ${skills}`);
    if (credentialId) descriptionParts.push(credentialId);
    const description = descriptionParts.length ? descriptionParts.join(' • ') : `${issuer} • ${date}`;

    openModalContent({
      title,
      description,
      tags,
      actions,
      screenshots: [certImage || fallbackPoster],
      fallbackImage: fallbackPoster
    });
  }

  function closeModal() {
    clearFullscreenUiTimer();
    modalGallery.classList.remove('fs-ui-hidden');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
  fsExitBtn?.addEventListener('click', () => {
    if (!document.fullscreenElement) return;
    document.exitFullscreen().catch(() => {});
  });

  galleryImgs.addEventListener('click', e => {
    if (!e.target.classList.contains('modal-gallery-img')) return;
    toggleActiveScreenshotFullscreen();
  });

  modalGallery.addEventListener('mousemove', () => {
    if (!isGalleryFullscreen()) return;
    showFullscreenUi();
  }, { passive: true });

  modalGallery.addEventListener('touchstart', () => {
    if (!isGalleryFullscreen()) return;
    showFullscreenUi();
  }, { passive: true });

  document.addEventListener('fullscreenchange', () => {
    if (isGalleryFullscreen()) {
      showFullscreenUi();
      return;
    }
    clearFullscreenUiTimer();
    modalGallery.classList.remove('fs-ui-hidden');
  });

  /* Touch devices never see the :hover overlay, so mark every clickable card with a
     badge that is always on screen. */
  const touchOnly = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  function addTapHint(el, label) {
    if (el.querySelector('.tap-hint')) return;
    const hint = document.createElement('span');
    hint.className = 'tap-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = touchOnly ? `👆 Tap to ${label}` : `🔍 Click to ${label}`;
    el.appendChild(hint);
  }

  document.querySelectorAll('.pub-cover').forEach(cover => {
    const card = cover.closest('.pub-card');
    /* Drawn placeholder key art is still an .svg; anything else is a real capture. */
    const isArt = (cover.querySelector('img')?.getAttribute('src') || '').endsWith('.svg');
    cover.classList.toggle('cover-art', isArt);
    addTapHint(cover, isArt ? 'view art' : 'view shots');
    cover.setAttribute('role', 'button');
    cover.setAttribute('tabindex', '0');
    cover.addEventListener('click', () => openPublishedGameModal(card));
    cover.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      openPublishedGameModal(card);
    });
  });

  document.querySelectorAll('.cert-card').forEach(card => {
    addTapHint(card, 'view cert');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      openCertificateModal(card);
    });
    card.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      openCertificateModal(card);
    });
  });

  document.getElementById('game-modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
        return;
      }
      closeModal();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(currentIndex - 1);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(currentIndex + 1);
    }
  });
})();
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9999;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,255,163,0.06) 0%, transparent 70%);
    will-change: transform;
    top: 0; left: 0;
  `;
  document.body.appendChild(glow);

  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  (function loop() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    glow.style.transform = `translate(${cx - 150}px, ${cy - 150}px)`;
    requestAnimationFrame(loop);
  })();
}
