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
document.querySelectorAll('.project-card').forEach(el => revealObserver.observe(el));
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
      'https://img.itch.zone/aW1nLzI1Njk2NTA2LmpwZw==/original/KtMHYj.jpg',
      'https://img.itch.zone/aW1hZ2UvNDI4NDUxOC8yNTY2MzczMS5wbmc=/original/X6K9Zg.png',
      'https://img.itch.zone/aW1hZ2UvNDI4NDUxOC8yNTY2MzczMi5wbmc=/original/RgCQOb.png',
      'https://img.itch.zone/aW1hZ2UvNDI4NDUxOC8yNTY2MzczMC5wbmc=/original/ijt6g3.png',
      'https://img.itch.zone/aW1hZ2UvNDI4NDUxOC8yNTY2MzczMy5wbmc=/original/BPAw7n.png'
    ]
  },
  '03': {
    screenshots: [
      'https://img.itch.zone/aW1nLzI0Mjg4OTM1LnBuZw==/original/fH3JnI.png',
      'https://img.itch.zone/aW1hZ2UvNDA3NDc3MS8yNDI4ODk2Ny5wbmc=/original/3Nxzso.png',
      'https://img.itch.zone/aW1hZ2UvNDA3NDc3MS8yNDI4ODk3MS5wbmc=/original/4iakFT.png',
      'https://img.itch.zone/aW1hZ2UvNDA3NDc3MS8yNDI4ODk0OC5wbmc=/original/3w4Td2.png',
      'https://img.itch.zone/aW1hZ2UvNDA3NDc3MS8yNDI4ODk5MC5wbmc=/original/%2FYorlO.png'
    ]
  },
  '04': {
    screenshots: [
      'https://img.itch.zone/aW1nLzIzNzU3OTkwLmpwZw==/original/nfW7g5.jpg',
      'https://img.itch.zone/aW1hZ2UvMzk3NzQ2Ny8yMzc1Nzk5NS5wbmc=/original/6lzvZj.png',
      'https://img.itch.zone/aW1hZ2UvMzk3NzQ2Ny8yMzc1Nzk5My5wbmc=/original/qgly6U.png',
      'https://img.itch.zone/aW1hZ2UvMzk3NzQ2Ny8yMzc1Nzk5NC5wbmc=/original/f4jVaE.png'
    ]
  },
  '05': {
    screenshots: [
      'https://img.itch.zone/aW1nLzIzNjcxNzY0LnBuZw==/original/JUaJTr.png',
      'https://img.itch.zone/aW1hZ2UvMzk2OTQyOC8yMzY3MTgxMC5wbmc=/original/LmzrEr.png',
      'https://img.itch.zone/aW1hZ2UvMzk2OTQyOC8yMzY3MTgxMy5wbmc=/original/8NzCza.png',
      'https://img.itch.zone/aW1hZ2UvMzk2OTQyOC8yMzY3MTgxNi5wbmc=/original/6867VU.png',
      'https://img.itch.zone/aW1hZ2UvMzk2OTQyOC8yMzY3MTgxOC5wbmc=/original/s%2FqIx6.png'
    ]
  },
  '06': {
    screenshots: [
      'https://img.itch.zone/aW1nLzE1MjUyNTcxLnBuZw==/original/13QBvi.png'
    ]
  },
  '07': {
    screenshots: [
      'https://img.itch.zone/aW1nLzE2OTgyNTI1LnBuZw==/original/glyJIm.png'
    ]
  },
  '08': {
    screenshots: [
      'https://img.itch.zone/aW1nLzIzNjQ5MzEyLnBuZw==/original/3XCMBk.png',
      'https://img.itch.zone/aW1nLzIzNjQ4NDk0LnBuZw==/original/%2BtuFWR.png'
    ]
  },
  '09': {
    screenshots: [
      'https://img.itch.zone/aW1nLzE1MjgxNjM1LnBuZw==/original/lO3Zf5.png'
    ]
  }
};

const PROJECTS_DATA = {
  'HackNet: Urban Anarchy': {
    palette: ['#3b1f66', '#0c4a6e']
  },
  'Fruit Ninja VR': {
    palette: ['#0f766e', '#1e3a8a']
  },
  'Toon Tank': {
    palette: ['#1f2937', '#7c2d12']
  },
  'Narrative Driven Game': {
    palette: ['#1e1b4b', '#1f2937']
  },
  'First Person Shooter': {
    palette: ['#3f1d1d', '#111827']
  },
  'The Python (Snake Game)': {
    palette: ['#0f3d2f', '#1f2937']
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
  const prevBtn       = overlay.querySelector('.gallery-arrow.prev');
  const nextBtn       = overlay.querySelector('.gallery-arrow.next');
  const modalTitle    = overlay.querySelector('.modal-title');
  const modalDesc     = overlay.querySelector('.modal-desc');
  const modalTags     = overlay.querySelector('.modal-tags');
  const modalActions  = overlay.querySelector('.modal-actions');

  let currentIndex = 0;
  let totalScreenshots = 0;

  function toggleActiveScreenshotFullscreen() {
    const activeImg = galleryImgs.querySelector('.modal-gallery-img.active');
    if (!activeImg) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    activeImg.requestFullscreen?.().catch(() => {});
  }

  function goTo(idx) {
    if (totalScreenshots <= 1) return;
    currentIndex = (idx + totalScreenshots) % totalScreenshots;
    updateGallery();
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

  function openFeaturedProjectModal(card) {
    const title = card.querySelector('h3').textContent.trim();
    const data = PROJECTS_DATA[title];
    if (!data) return;

    const tags = Array.from(card.querySelectorAll('.project-tags span')).map(t => t.textContent.trim());
    const posterUrl = createProjectPosterDataUrl(title, tags, data.palette);

    const codeLink = card.querySelector('.project-links a');
    const actions = codeLink ? [{
      href: codeLink.href,
      label: '⌥ Code',
      className: 'pub-btn gh'
    }] : [];

    openModalContent({
      title,
      description: card.querySelector('p').textContent.trim(),
      tags,
      actions,
      screenshots: [posterUrl],
      fallbackImage: posterUrl
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

  function initProjectCovers() {
    document.querySelectorAll('.project-card').forEach(card => {
      const title = card.querySelector('h3')?.textContent.trim();
      if (!title || card.querySelector('.project-cover')) return;

      const tags = Array.from(card.querySelectorAll('.project-tags span')).map(t => t.textContent.trim());
      const palette = PROJECTS_DATA[title]?.palette || ['#1f2937', '#111827'];

      const cover = document.createElement('div');
      cover.className = 'project-cover';
      cover.style.setProperty('--cover-a', palette[0]);
      cover.style.setProperty('--cover-b', palette[1]);

      const badge = document.createElement('span');
      badge.className = 'project-cover-badge';
      badge.textContent = 'Preview';

      const t = document.createElement('span');
      t.className = 'project-cover-title';
      t.textContent = title;

      cover.appendChild(badge);
      cover.appendChild(t);

      card.prepend(cover);
    });
  }

  function closeModal() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  galleryImgs.addEventListener('click', e => {
    if (!e.target.classList.contains('modal-gallery-img')) return;
    toggleActiveScreenshotFullscreen();
  });

  document.querySelectorAll('.pub-cover').forEach(cover => {
    cover.addEventListener('click', () => openPublishedGameModal(cover.closest('.pub-card')));
  });

  initProjectCovers();

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      openFeaturedProjectModal(card);
    });
  });

  document.querySelectorAll('.cert-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
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
    if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
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
