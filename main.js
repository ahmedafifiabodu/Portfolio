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
const SKILL_PIP_TOTAL = 5;

document.querySelectorAll('.skill-row').forEach(row => {
  const pips = row.querySelector('.skill-pips');
  if (!pips) return;
  const level = Math.max(0, Math.min(SKILL_PIP_TOTAL, Number(row.dataset.level) || 0));
  for (let i = 0; i < SKILL_PIP_TOTAL; i++) {
    const pip = document.createElement('span');
    pip.className = 'skill-pip';
    if (i < level) {
      pip.dataset.fill = 'true';
      pip.style.setProperty('--pip-delay', `${i * 90}ms`);
    }
    pips.appendChild(pip);
  }
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

/* light each skill meter once it scrolls into view */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.skill-pip[data-fill]').forEach(pip => {
      pip.classList.add('lit');
    });
    skillObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-levels').forEach(el => skillObserver.observe(el));

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
   CV AUTO-DOWNLOAD
   Renders the live CV page (so it never drifts from the visible
   HTML) into a PDF with html2canvas + jsPDF and saves it straight
   to disk — no print dialog, no manual step. The link then opens
   the page too, same as it always has.
   ============================================ */
function loadScriptOnce(localSrc, cdnSrc, isReady) {
  if (isReady()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = localSrc;
    s.onload = resolve;
    s.onerror = () => {
      const s2 = document.createElement('script');
      s2.src = cdnSrc;
      s2.onload = resolve;
      s2.onerror = () => reject(new Error(`Failed to load ${localSrc}`));
      document.head.appendChild(s2);
    };
    document.head.appendChild(s);
  });
}

function ensureCvPdfLibs() {
  return Promise.all([
    loadScriptOnce(
      'assets/libs/jspdf.umd.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      () => window.jspdf && window.jspdf.jsPDF
    ),
    loadScriptOnce(
      'assets/libs/html2canvas.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
      () => window.html2canvas
    ),
  ]);
}

async function downloadCvPdf(pageUrl, filename) {
  await ensureCvPdfLibs();

  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px;height:0;border:0;';
  document.body.appendChild(frame);

  try {
    await new Promise((resolve, reject) => {
      frame.onload = resolve;
      frame.onerror = () => reject(new Error('Failed to load CV page'));
      frame.src = pageUrl;
    });
    const cvDoc = frame.contentDocument;

    // html2canvas renders its clone in a document based at the site root,
    // so the CV's relative <link href="cv.css"> would re-resolve to /cv.css
    // and 404 — producing an unstyled PDF. Inline the stylesheets first so
    // the clone carries them no matter where it is based.
    const sheetLinks = [...cvDoc.querySelectorAll('link[rel="stylesheet"]')];
    await Promise.all(sheetLinks.map(async (link) => {
      const css = await fetch(link.href).then((r) => {
        if (!r.ok) throw new Error(`Stylesheet ${link.href} failed (${r.status})`);
        return r.text();
      });
      const styleEl = cvDoc.createElement('style');
      styleEl.textContent = css;
      link.replaceWith(styleEl);
    }));

    if (cvDoc.fonts && cvDoc.fonts.ready) await cvDoc.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const sheet = cvDoc.querySelector('.sheet');
    if (!sheet) throw new Error('CV content not found');

    // Collect the bottom edge of every block that must not be split, in
    // CSS px relative to the top of the sheet. Pages get cut at one of
    // these instead of at a fixed height, so a break never lands through
    // a line of text.
    const sheetTop = sheet.getBoundingClientRect().top;
    const edgeOf = (el) => ({
      top: el.getBoundingClientRect().top - sheetTop,
      bottom: el.getBoundingClientRect().bottom - sheetTop,
    });

    // A heading must stay with what it introduces, so the span from a
    // heading's top through the end of the block after it is off limits —
    // otherwise a section title gets stranded alone at the foot of a page.
    const keepWithNext = [...sheet.querySelectorAll('h1, h2, h3')].map((heading) => {
      const follower = heading.nextElementSibling;
      return {
        start: edgeOf(heading).top - 4,
        end: edgeOf(follower || heading).bottom,
      };
    });

    const breakCandidates = [...sheet.querySelectorAll(
      'p, li, dt, dd, figure, .job, .job-head, .job-sub, .chips, .two'
    )]
      .map((el) => edgeOf(el).bottom)
      .filter((y) => y > 0)
      .filter((y) => !keepWithNext.some((zone) => y > zone.start && y < zone.end));

    // Elements marked .page-break-before start a page of their own, matching
    // the break-before: page they already get in the browser's print output.
    const forcedBreaks = [...sheet.querySelectorAll('.page-break-before')]
      .map((el) => edgeOf(el).top - 4)
      .filter((y) => y > 0);

    const canvas = await window.html2canvas(sheet, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: sheet.scrollWidth,
      windowHeight: sheet.scrollHeight,
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const pxPerMm = canvas.width / pageW;
    const pageHeightPx = Math.floor(pageH * pxPerMm);

    // CSS px -> canvas px, so the DOM-derived break points line up with
    // the rasterized image regardless of the capture scale.
    const cssToCanvas = canvas.height / sheet.scrollHeight;
    const breaksPx = [...new Set(breakCandidates.map((y) => Math.round(y * cssToCanvas)))]
      .sort((a, b) => a - b);
    const forcedPx = [...new Set(forcedBreaks.map((y) => Math.round(y * cssToCanvas)))]
      .sort((a, b) => a - b);

    let renderedPx = 0;
    let firstPage = true;
    while (renderedPx < canvas.height) {
      const maxCut = renderedPx + pageHeightPx;
      let cut = maxCut;

      // A forced break inside this page wins outright — the rest of the
      // page is left blank so the marked section starts on a fresh one.
      const forced = forcedPx.find((y) => y > renderedPx + 1 && y <= maxCut);
      if (forced) {
        cut = forced;
      } else if (maxCut < canvas.height) {
        // Deepest safe break that still fills a reasonable amount of the
        // page; if nothing qualifies, fall back to a hard cut.
        const minCut = renderedPx + pageHeightPx * 0.5;
        const safe = breaksPx.filter((y) => y > minCut && y <= maxCut);
        if (safe.length) cut = safe[safe.length - 1];
      } else {
        cut = canvas.height;
      }

      const sliceHeightPx = cut - renderedPx;
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeightPx;
      const sctx = sliceCanvas.getContext('2d');
      sctx.fillStyle = '#ffffff';
      sctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      sctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

      if (!firstPage) doc.addPage();
      firstPage = false;
      doc.addImage(sliceCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageW, sliceHeightPx / pxPerMm);
      renderedPx = cut;
    }

    doc.save(filename);
  } finally {
    frame.remove();
  }
}

document.querySelectorAll('a[href^="cv/"][href$=".html"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    if (link.dataset.pdfBusy === '1') return;
    // Take over navigation entirely: some browsers/extensions turn
    // target="_blank" into a same-tab navigation, which would unload
    // this document mid-render and kill the download. Open the
    // destination tab synchronously (inside the click, so it isn't
    // treated as a blocked popup), then point it at the CV page once
    // the PDF has actually saved.
    e.preventDefault();
    link.dataset.pdfBusy = '1';
    const href = link.getAttribute('href');
    const filename = href.split('/').pop().replace('.html', '.pdf');
    const popup = window.open('', '_blank');
    downloadCvPdf(href, filename)
      .catch((err) => console.error('CV PDF download failed:', err))
      .finally(() => {
        link.dataset.pdfBusy = '0';
        if (popup) popup.location.href = href;
        else window.open(href, '_blank');
      });
  });
});

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
  /* NEON COIL - personal project. */
  '02': {
    screenshots: [
      'assets/covers/neon-coil-cover.png',
      'https://raw.githubusercontent.com/ahmedafifiabodu/SnakeGame/master/docs/shot_play.png',
      'https://raw.githubusercontent.com/ahmedafifiabodu/SnakeGame/master/docs/shot_netplay.png',
      'https://raw.githubusercontent.com/ahmedafifiabodu/SnakeGame/master/docs/shot_lobby.png',
      'https://raw.githubusercontent.com/ahmedafifiabodu/SnakeGame/master/docs/shot_options.png',
      'https://raw.githubusercontent.com/ahmedafifiabodu/SnakeGame/master/docs/shot_menu.png'
    ]
  },
  /* Clan System - personal project. */
  '03': {
    screenshots: [
      'assets/covers/clan-system.png',
      'assets/covers/clan-chat-voice.png',
      'assets/covers/clan-chat-emoji.png',
      'assets/covers/clan-notifications.png',
      'assets/covers/clan-leaderboard-players.png',
      'assets/covers/clan-leaderboard-clans.png',
      'assets/covers/clan-friends-tab.png'
    ]
  },
  /* Configurable Autosave - personal project. */
  '04': {
    screenshots: [
      'https://assetstorev1-prd-cdn.unity3d.com/key-image/e41cc31e-81fd-4746-b854-8de5867b79ba.jpg'
    ]
  },
  '05': {
    screenshots: [
      'https://img.itch.zone/aW1nLzI1Njk2Mjc0LnBuZw==/original/8os3hT.png',
      'https://img.itch.zone/aW1hZ2UvNDI4NDUxOC8yNTY2MzczMS5wbmc=/original/X6K9Zg.png',
      'https://img.itch.zone/aW1hZ2UvNDI4NDUxOC8yNTY2MzczMi5wbmc=/original/RgCQOb.png',
      'https://img.itch.zone/aW1hZ2UvNDI4NDUxOC8yNTY2MzczMC5wbmc=/original/ijt6g3.png',
      'https://img.itch.zone/aW1hZ2UvNDI4NDUxOC8yNTY2MzczMy5wbmc=/original/BPAw7n.png'
    ]
  },
  '06': {
    screenshots: [
      'https://img.itch.zone/aW1nLzI0Mjg4OTM1LnBuZw==/original/fH3JnI.png',
      'https://img.itch.zone/aW1hZ2UvNDA3NDc3MS8yNDI4ODk2Ny5wbmc=/original/3Nxzso.png',
      'https://img.itch.zone/aW1hZ2UvNDA3NDc3MS8yNDI4ODk3MS5wbmc=/original/4iakFT.png',
      'https://img.itch.zone/aW1hZ2UvNDA3NDc3MS8yNDI4ODk4OC5wbmc=/original/3w4Td2.png',
      'https://img.itch.zone/aW1hZ2UvNDA3NDc3MS8yNDI4ODk5MC5wbmc=/original/%2FYorlO.png'
    ]
  },
  '07': {
    screenshots: [
      'https://img.itch.zone/aW1nLzIzNzU3OTkwLmpwZw==/original/nfW7g5.jpg',
      'https://img.itch.zone/aW1hZ2UvMzk3NzQ2Ny8yMzc1Nzk5NS5wbmc=/original/6lzvZj.png',
      'https://img.itch.zone/aW1hZ2UvMzk3NzQ2Ny8yMzc1Nzk5My5wbmc=/original/qgly6U.png',
      'https://img.itch.zone/aW1hZ2UvMzk3NzQ2Ny8yMzc1Nzk5NC5wbmc=/original/f4jVaE.png'
    ]
  },
  '08': {
    screenshots: [
      'https://img.itch.zone/aW1nLzIzNjcxNzY0LnBuZw==/original/JUaJTr.png',
      'https://img.itch.zone/aW1hZ2UvMzk2OTQyOC8yMzY3MTgxMC5wbmc=/original/LmzrEr.png',
      'https://img.itch.zone/aW1hZ2UvMzk2OTQyOC8yMzY3MTgxMy5wbmc=/original/8NzCza.png',
      'https://img.itch.zone/aW1hZ2UvMzk2OTQyOC8yMzY3MTgxNi5wbmc=/original/6867VU.png',
      'https://img.itch.zone/aW1hZ2UvMzk2OTQyOC8yMzY3MTgxOC5wbmc=/original/s%2FqIx6.png'
    ]
  },
  '09': {
    screenshots: [
      'https://img.itch.zone/aW1nLzE1MjUyNTcxLnBuZw==/original/13QBvi.png'
    ]
  },
  '10': {
    screenshots: [
      'https://img.itch.zone/aW1nLzE2OTgyNTI1LnBuZw==/original/glyJIm.png'
    ]
  },
  '11': {
    screenshots: [
      'https://img.itch.zone/aW1nLzIzNjQ5MzEyLnBuZw==/original/3XCMBk.png',
      'https://img.itch.zone/aW1nLzIzNjQ4NDk0LnBuZw==/original/%2BtuFWR.png'
    ]
  },
  '12': {
    screenshots: [
      'https://img.itch.zone/aW1nLzE1MjgxNjM1LnBuZw==/original/lO3Zf5.png'
    ]
  },
  /* In-development work. */
  /* Backdoor Dilemma - 2024 Studios. Screenshots come from the App Store listing. */
  '13': {
    screenshots: [
      'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/a8/26/4f/a8264fb9-9928-f340-acf5-953ed5755670/Screenshot_20260802-183916.jpg/1286x594bb.webp',
      'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/07/a0/86/07a08694-b859-5bfe-5d9f-24bc7f4e18ef/Screenshot_20260802-184026.jpg/1286x594bb.webp',
      'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/cc/13/80/cc13801d-a1ac-5974-30fc-d7d349029d75/Screenshot_20260802-184333.jpg/1286x594bb.webp',
      'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/4b/48/b9/4b48b980-1c21-484b-b9f1-52ed6bde1463/Screenshot_20260802-184435.jpg/1286x594bb.webp'
    ]
  },
  '14': {
    screenshots: [
      'assets/covers/tales-of-khayaal.png'
    ]
  },
  '15': {
    screenshots: [
      'assets/covers/project-clash.png'
    ]
  },
  /* Rabeh - Rabih - freelance project. */
  '16': {
    screenshots: [
      'assets/covers/rabeh.png',
      'assets/covers/rabeh-home.png',
      'assets/covers/rabeh-games.png'
    ]
  },
  /* Temple Garden - Sana Games Studio. */
  '17': {
    screenshots: [
      'https://sanagamesstudio.com/temple_garden_game_poster.png',
      'assets/videos/temple-garden-gameplay.mp4',
      'https://sanagamesstudio.com/temple_garden_game_image_1.png',
      'https://sanagamesstudio.com/temple_garden_game_image_2.png',
      'https://sanagamesstudio.com/temple_garden_game_image_3.png',
      'https://sanagamesstudio.com/temple_garden_game_image_4.png',
      'https://sanagamesstudio.com/temple_garden_game_image_5.png',
      'https://sanagamesstudio.com/temple_garden_game_image_6.png'
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

  /* Zoom is a CSS class, not the Fullscreen API — that API silently fails
     ("Permissions check failed") inside iframes and some policy-restricted
     browsers with no way to detect it in advance, so it can't be the only path. */
  function isGalleryZoomed() {
    return modalGallery.classList.contains('zoomed');
  }

  function scheduleFullscreenUiFade() {
    clearFullscreenUiTimer();
    if (!isGalleryZoomed()) return;
    fsUiTimer = setTimeout(() => {
      modalGallery.classList.add('fs-ui-hidden');
    }, 1000);
  }

  function showFullscreenUi() {
    modalGallery.classList.remove('fs-ui-hidden');
    scheduleFullscreenUiFade();
  }

  /* The modal owns the transform that would otherwise trap the fixed-position
     gallery, so it has to be told about the zoom too. */
  const modalBox = modalGallery.closest('.game-modal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const ZOOM_MS = 280;
  const ZOOM_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
  let zoomAnim = null;

  const galleryRect = () => modalGallery.getBoundingClientRect();
  const addZoomClasses = () => {
    modalBox?.classList.add('gallery-zoomed');
    modalGallery.classList.add('zoomed');
  };
  const dropZoomClasses = () => {
    modalGallery.classList.remove('zoomed');
    modalBox?.classList.remove('gallery-zoomed');
  };

  /* Transform that visually maps `from` onto `to` (transform-origin is 0 0). */
  function mapRect(from, to) {
    return `translate(${to.left - from.left}px, ${to.top - from.top}px)` +
           ` scale(${to.width / from.width}, ${to.height / from.height})`;
  }

  /* FLIP: the class swap is instant (a transitioning transform would re-trap the
     fixed gallery), then the easing plays as a transform. `fill: forwards` plus a
     deferred onFinish lets the exit stay position:fixed for the whole animation —
     a scaled-up in-flow element would inflate the modal's scrollable overflow and
     flash scrollbars. */
  function playZoom(frames, onFinish) {
    zoomAnim?.cancel();
    zoomAnim = null;

    if (reducedMotion.matches || frames.some(t => t === null)) {
      onFinish?.();
      return;
    }

    const anim = modalGallery.animate(
      frames.map(transform => ({ transform })),
      { duration: ZOOM_MS, easing: ZOOM_EASE, fill: 'forwards' }
    );
    zoomAnim = anim;
    anim.finished.then(() => {
      if (zoomAnim !== anim) return;
      zoomAnim = null;
      anim.cancel();          // drop the forwards-fill before restoring layout
      onFinish?.();
    }).catch(() => {});
  }

  function exitGalleryZoom(animate = true) {
    clearFullscreenUiTimer();
    modalGallery.classList.remove('fs-ui-hidden');
    if (!isGalleryZoomed()) {
      zoomAnim?.cancel();
      zoomAnim = null;
      modalBox?.classList.remove('gallery-zoomed');
      return;
    }
    if (!animate) {
      zoomAnim?.cancel();
      zoomAnim = null;
      dropZoomClasses();
      return;
    }

    const full = galleryRect();
    dropZoomClasses();
    const small = galleryRect();
    addZoomClasses();         // stay fixed while animating; measured without painting
    playZoom(['none', mapRect(full, small)], dropZoomClasses);
  }

  function toggleActiveScreenshotFullscreen() {
    if (isGalleryZoomed()) {
      exitGalleryZoom();
      return;
    }
    const small = galleryRect();
    addZoomClasses();
    const full = galleryRect();
    playZoom([mapRect(full, small), 'none'], null);
    showFullscreenUi();
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
      if (img.tagName === 'VIDEO' && i !== currentIndex) img.pause();
    });
    dotsArea.querySelectorAll('.gallery-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
    counterEl.textContent = totalScreenshots > 1 ? `${currentIndex + 1} / ${totalScreenshots}` : '';
  }

  function openModalContent({ title, description, tags, actions, screenshots, fallbackImage }) {
    const shots = screenshots || [];
    if (!shots.length) return;

    exitGalleryZoom(false);
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
      const isVideo = /\.(mp4|webm|mov)$/i.test(src);
      let img;
      if (isVideo) {
        img = document.createElement('video');
        img.src = src;
        img.controls = true;
        img.playsInline = true;
        img.preload = 'metadata';
        img.className = 'modal-gallery-img' + (i === 0 ? ' active' : '');
      } else {
        img = document.createElement('img');
        img.src     = src;
        img.alt     = `Screenshot ${i + 1}`;
        img.className = 'modal-gallery-img' + (i === 0 ? ' active' : '');
        img.loading = 'lazy';
        img.addEventListener('error', () => {
          img.src = fallbackImage || createProjectPosterDataUrl(title, tags, ['#1f2937', '#111827']);
        }, { once: true });
      }
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
    exitGalleryZoom(false);
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
  fsExitBtn?.addEventListener('click', () => {
    if (!isGalleryZoomed()) return;
    exitGalleryZoom();
  });

  galleryImgs.addEventListener('click', e => {
    if (!e.target.classList.contains('modal-gallery-img')) return;
    if (e.target.tagName === 'VIDEO') return;
    toggleActiveScreenshotFullscreen();
  });

  modalGallery.addEventListener('mousemove', () => {
    if (!isGalleryZoomed()) return;
    showFullscreenUi();
  }, { passive: true });

  modalGallery.addEventListener('touchstart', () => {
    if (!isGalleryZoomed()) return;
    showFullscreenUi();
  }, { passive: true });

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
      if (isGalleryZoomed()) {
        exitGalleryZoom();
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
