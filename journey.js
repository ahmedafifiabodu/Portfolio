/* journey.js — the portfolio as a full-screen side-scrolling level.
   Eight zones from 2013 to today: career pillars to land on, game gems to collect,
   skill totems to charge, trophies to inspect, and a beacon that hands you back to
   the classic page. Runs only while the site is in game mode. */
(function () {
  'use strict';

  const canvas = document.getElementById('journey-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const Mode = window.PortfolioMode;

  /* ── CONFIG ─────────────────────────────────────── */
  const WORLD_W   = 11500;
  const GRAVITY   = 1800;
  const SPEED     = 300;
  const SPRINT    = 1.7;
  const JUMP_VEL  = -760;
  const PLT_H     = 14;

  /* ── ZONES ──────────────────────────────────────── */
  const ZONES = [
    { name: 'Spawn Point',        sub: 'Press → to begin', from: 0,    to: 520,   accent: '#00ffa3', sky: ['#04060a', '#0b1220'], decor: 'city'  },
    { name: 'Foundations',        sub: '2013 – 2023',      from: 520,  to: 2150,  accent: '#00d4ff', sky: ['#050a14', '#13223c'], decor: 'city'  },
    { name: 'The Dojo — ITI', sub: '2023 – 2024',     from: 2150, to: 3600,  accent: '#f59e0b', sky: ['#100a04', '#2c1c0a'], decor: 'dunes' },
    { name: 'Training Grounds',   sub: 'Skills & tooling',      from: 3600, to: 4750,  accent: '#a855f7', sky: ['#0b0616', '#1f1139'], decor: 'grid'  },
    { name: 'Warsaw — Futuregames', sub: '2025 – 2026', from: 4750, to: 6650, accent: '#ff6b9d', sky: ['#060a12', '#1a2544'], decor: 'pines' },
    { name: 'The Studio — 2024 Studios', sub: '2024 – Present', from: 6650, to: 9200, accent: '#00ffa3', sky: ['#04100c', '#0c2b23'], decor: 'neon' },
    { name: 'Trophy Hall',        sub: 'Certifications',        from: 9200, to: 10600,  accent: '#ffd166', sky: ['#0d0a04', '#261e0a'], decor: 'vault' },
    { name: 'The Beacon',         sub: 'Get in touch',          from: 10600, to: WORLD_W, accent: '#00d4ff', sky: ['#02040a', '#091629'], decor: 'space' },
  ];

  /* ── CAREER PILLARS ─────────────────────────────── */
  const MILESTONES = [
    {
      type: 'career', wx: 620, w: 170, elev: 22, color: '#00ffa3',
      title: 'IT Specialist', company: 'Elfath Group',
      period: 'Aug 2013 – Jan 2023',
      desc: 'Sole admin of the company IT: built the Active Directory domain, DNS, DHCP and Group Policy baseline, ran Exchange for company mail, WSUS patching and WDS imaging on Hyper-V, locked down file shares with NTFS least privilege, and held the perimeter on a MikroTik firewall with Bitdefender GravityZone on every endpoint. 2 servers, 20–30 workstations, nine years.',
    },
    {
      type: 'career', wx: 1120, w: 175, elev: 64, color: '#00d4ff',
      title: 'Technical Support', company: 'Concentrix',
      period: 'Sep 2022 – Mar 2023',
      desc: 'Provided excellent customer care, resolving issues promptly with consistent follow-up. Maintained positive attitude and fostered empathy for team morale.',
    },
    {
      type: 'career', wx: 1620, w: 195, elev: 108, color: '#a855f7',
      title: 'Bachelor of CS', company: 'Modern Academy',
      period: 'Sep 2018 – May 2022',
      desc: 'Studied algorithms, data structures, software engineering & programming fundamentals at the Bachelor of Computer Science program.',
    },
    {
      type: 'career', wx: 2300, w: 205, elev: 132, color: '#f59e0b',
      title: 'Game Programming Diploma', company: 'ITI',
      period: 'Aug 2023 – Jun 2024',
      desc: 'Intensive 9-month professional diploma focused on game development, engine internals (Unity & Unreal), and game programming best practices.',
    },
    {
      type: 'career', wx: 4900, w: 205, elev: 70, color: '#ff6b9d',
      title: 'Game Developer', company: 'Futuregames Warsaw',
      period: 'Sep 2025 – Mar 2026',
      desc: 'Internship at Futuregames in Warsaw, Poland. Digital games in a studio environment, sharpening professional game dev skills.',
    },
    {
      type: 'career', wx: 6800, w: 200, elev: 94, color: '#00ffa3',
      title: 'Game Developer', company: '2024 Studios',
      period: 'Nov 2024 – Present',
      desc: 'Designing & programming engaging gameplay mechanics. Collaborating with artists to bring concepts to life and contributing to multiplayer game development.',
    },
  ];

  /* ── GAME GEMS ──────────────────────────────────── */
  const COLLECTABLES = [
    {
      type: 'game', wx: 2650, elevBase: 60, offset: 0.0, collected: false, color: '#f59e0b',
      title: 'Dawn of the Last Seeds', tag: 'Zanga Game Jam', period: 'Mid ITI · 2023',
      itchio: 'https://nourhan-taman.itch.io/dawn-of-the-last-seeds',
      github: 'https://github.com/NourhanToman/ZnaaJam2024',
      coverImg: 'https://img.itch.zone/aW1nLzE1MjUyNTcxLnBuZw==/original/13QBvi.png',
      desc: 'In a world of drought, the last three seeds are humanity\'s only hope to survive. Built during the Zanga Game Jam while at ITI.',
    },
    {
      type: 'game', wx: 2950, elevBase: 108, offset: 1.1, collected: false, color: '#f59e0b',
      title: 'Righteous Crane', tag: 'Egypt Game Jam', period: 'During ITI · 2023',
      itchio: 'https://mohamed-elkholy.itch.io/righteous-crane',
      github: 'https://github.com/ahmedafifiabodu/Dressrosa',
      coverImg: 'https://img.itch.zone/aW1nLzE1MjgxNjM1LnBuZw==/original/lO3Zf5.png',
      desc: 'Play as the land\'s righteous crane, striving to solve the people\'s problems. Created at the Egypt Game Jam during ITI.',
    },
    {
      type: 'game', wx: 3250, elevBase: 68, offset: 2.3, collected: false, color: '#f59e0b',
      title: 'The Kitten & The Hidden', tag: 'Graduation Project', period: 'End of ITI · 2024',
      itchio: 'https://nayrayehya.itch.io/the-kitten-and-the-hidden',
      github: 'https://github.com/1Rooky/The-Kitten-and-The-Hidden',
      coverImg: 'https://img.itch.zone/aW1nLzE2OTgyNTI1LnBuZw==/original/glyJIm.png',
      desc: 'A ghost wanders the world with a persistent cat companion — his beloved pet from a past life. The graduation project at the end of ITI.',
    },
    {
      type: 'game', wx: 5250, elevBase: 50, offset: 0.5, collected: false, color: '#ff6b9d',
      title: 'Vampire Survival', tag: 'Game Assignment', period: 'Futuregames · 2025',
      itchio: 'https://ahmedafifiabodu.itch.io/vampire-survival',
      github: 'https://github.com/ahmedafifiabodu/VampireSurvivors',
      coverImg: 'https://img.itch.zone/aW1nLzIzNjcxNzY0LnBuZw==/original/JUaJTr.png',
      desc: 'Survive endless waves of enemies, grow your powers, and outlast the night. A game assignment completed at Futuregames Warsaw.',
    },
    {
      type: 'game', wx: 5550, elevBase: 100, offset: 1.7, collected: false, color: '#ff6b9d',
      title: 'Project Trash', tag: 'GP1 · On Steam', period: 'Futuregames · 2025',
      steam: 'https://store.steampowered.com/app/4798760/Project_Trash/',
      itchio: 'https://futuregames.itch.io/projecttrash',
      github: 'https://github.com/F8Code/ProjectTrash',
      coverImg: 'https://img.itch.zone/aW1nLzI0Mjg4OTM1LnBuZw==/original/fH3JnI.png',
      desc: 'Employed to recycle — sort fast, sort correctly, don\'t get fired! Group Project 1 at Futuregames, now published on Steam.',
    },
    {
      type: 'game', wx: 5850, elevBase: 64, offset: 3.1, collected: false, color: '#ff6b9d',
      title: 'Forest of the Wicked', tag: 'Game Jam', period: 'Futuregames · 2025',
      itchio: 'https://gothmothdev.itch.io/forest-of-the-wicked',
      github: 'https://github.com/untalpanda/ForestOfTheWicked-v1.0',
      coverImg: 'https://img.itch.zone/aW1nLzIzNjQ5MzEyLnBuZw==/original/3XCMBk.png',
      desc: 'A dark atmospheric horror-adventure — dare to venture into the wicked forest. A game jam entry built with a passionate team.',
    },
    {
      type: 'game', wx: 6150, elevBase: 120, offset: 0.8, collected: false, color: '#ff6b9d',
      title: 'Parasozhyt', tag: 'Game Jam', period: 'Futuregames · 2025',
      itchio: 'https://gamekernel.itch.io/parasozhyt',
      github: 'https://github.com/ahmedafifiabodu/FutureGameJam',
      coverImg: 'https://img.itch.zone/aW1nLzIzNzU3OTkwLmpwZw==/original/nfW7g5.jpg',
      desc: 'Fast-paced body-hopping shooter — survive by constantly switching hosts before they die. A jam entry at Futuregames.',
    },
    {
      type: 'game', wx: 6450, elevBase: 76, offset: 2.0, collected: false, color: '#ff6b9d',
      title: 'Voita', tag: 'GP2', period: 'Futuregames · 2025–26',
      itchio: 'https://futuregames.itch.io/voita',
      github: 'https://github.com/hasanjahromi/SpaceStationEvolution',
      coverImg: 'https://img.itch.zone/aW1nLzI1Njk2Mjc0LnBuZw==/original/8os3hT.png',
      desc: 'Turn-based sci-fi predator game: set traps, drag bodies, evolve new powers. Group Project 2 — the final major project at Futuregames.',
    },
    {
      type: 'game', wx: 7150, elevBase: 86, offset: 1.4, collected: false, color: '#00ffa3',
      title: 'Prime Press', tag: 'Mobile App', period: '2024 Studios · 2025',
      gplay: 'https://play.google.com/store/apps/details?id=com.PrimePress.PrimePressEKit&hl=en',
      appstore: 'https://apps.apple.com/us/app/prime-press-e-kit/id6743487373',
      coverImg: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/74/ee/3a/74ee3a67-6746-ecc4-5147-3cbbc8defa33/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/460x0w.jpg',
      desc: 'Interactive educational platform with digital coursebooks, workbooks, and classroom tools for students and teachers. Published on Google Play & App Store.',
    },
    {
      type: 'game', wx: 7450, elevBase: 58, offset: 2.4, collected: false, color: '#e6edf3', role: 'Personal',
      title: 'Configurable Autosave', tag: 'Unity Asset Store', period: 'Released Jul 2026',
      coverImg: 'https://assetstorev1-prd-cdn.unity3d.com/key-image/e41cc31e-81fd-4746-b854-8de5867b79ba.jpg',
      links: [
        { label: '⬢ Asset Store',  href: 'https://assetstore.unity.com/packages/tools/utilities/configurable-autosave-313115', cls: 'jm-link-steam' },
        { label: '🔗 Announcement', href: 'https://www.linkedin.com/feed/update/urn:li:activity:7490402919234686977/', cls: 'jm-link-gh' },
      ],
      desc: 'A free Unity 6 editor extension that saves your work automatically on rules you set. Built with UI Toolkit, supports Built-in, URP and HDRP — published on the Unity Asset Store.',
    },
    /* — In development at 2024 Studios — */
    {
      type: 'game', wx: 7750, elevBase: 118, offset: 0.3, collected: false, color: '#f59e0b', wip: true,
      title: 'Tales of Khayaal', tag: 'In Development', period: '2024 Studios · 2026',
      coverImg: 'assets/covers/tales-of-khayaal.png',
      links: [
        { label: '🌐 Website',   href: 'https://www.talesofkhayaal.com', cls: 'jm-link-steam' },
        { label: '◈ Campaign',   href: 'https://www.launchgood.com/v4/campaign/tales_of_khayaal_by_gould_studio?src=internal_comm_page', cls: 'jm-link-itch' },
        { label: '▶ Gameplay',   href: 'https://www.linkedin.com/posts/petergouldart_tales-of-khayaal-community-update-1-activity-7421105535976067072-rrjW/', cls: 'jm-link-gh' },
        { label: '▶ Playtest',   href: 'https://www.linkedin.com/posts/petergouldart_big-update-youre-invited-to-play-our-first-activity-7460591484866596864-p2EH/', cls: 'jm-link-gh' },
      ],
      desc: 'Narrative action-adventure in the Tales of Khayaal universe by Gould Studio. I build the gameplay systems — abilities & attributes, combat driven by a custom in-editor attack authoring tool, traversal, crowds and a quest system across a living city.',
    },
    {
      type: 'game', wx: 8050, elevBase: 62, offset: 1.9, collected: false, color: '#a855f7', wip: true,
      title: 'Project Clash', tag: 'In Development', period: '2024 Studios · 2026',
      coverImg: 'assets/covers/project-clash.png',
      note: 'Internal project — not public',
      desc: 'Multiplayer VR card battler in the spirit of Clash Royale. Draw from your deck, deploy units down the lanes and break the opposing towers — room-scale in VR, with networked matches, voice chat and a spectator view.',
    },
    {
      type: 'game', wx: 8350, elevBase: 100, offset: 2.7, collected: false, color: '#00d4ff', wip: true,
      title: 'Puzzle Escape Room', tag: 'In Development', period: '2024 Studios · 2026',
      coverImg: 'assets/covers/puzzle-escape-room.png',
      note: 'Internal project — not public',
      desc: 'Co-op multiplayer puzzle horror. A team works through a derelict hospital cracking code terminals, hunting keys and surviving what walks the corridors, trying to find the way out together.',
    },
    {
      type: 'game', wx: 8650, elevBase: 70, offset: 1.2, collected: false, color: '#38bdf8', role: 'Personal',
      title: 'Clan System', tag: 'Open Source · MIT', period: 'Released Aug 2026',
      coverImg: 'assets/covers/clan-system.png',
      links: [
        { label: '⬡ GitHub', href: 'https://github.com/ahmedafifiabodu/Clan-System', cls: 'jm-link-gh' },
      ],
      desc: 'Server-authoritative clan, chat and voice system for Unity 6 on Unity Gaming Services. Cloud Code owns every mutation — roles, invites, moderation, leaderboards and Vivox voice — shipped as a UPM package with Play Mode tests run against the live backend.',
    },
    {
      type: 'game', wx: 8800, elevBase: 82, offset: 2.1, collected: false, color: '#00ffa3', role: 'Personal',
      title: 'NEON COIL', tag: 'Open Source · MIT', period: 'Released Aug 2026',
      coverImg: 'assets/covers/neon-coil-cover.png',
      links: [
        { label: '⌥ Code', href: 'https://github.com/ahmedafifiabodu/SnakeGame', cls: 'jm-link-gh' },
        { label: '⬇ v0.3.0', href: 'https://github.com/ahmedafifiabodu/SnakeGame/releases/tag/v0.3.0', cls: 'jm-link-gh' },
      ],
      desc: 'Arcade snake in C++20 on SFML 3 — procedurally generated levels, five snake types with real abilities, and up to 4-player networked multiplayer with client-side prediction so turns never feel late.',
    },
    {
      type: 'game', wx: 8950, elevBase: 110, offset: 3.4, collected: false, color: '#f472b6', wip: true, role: 'Freelance',
      title: 'Rabeh — رابح', tag: 'In Development', period: '2026',
      coverImg: 'assets/covers/rabeh.png',
      note: 'Private repository — not public',
      desc: "MENA's first reward-gaming mobile platform. Play casual games, work through a daily quest chain, redeem real brand-funded vouchers. The economy is fully server-authoritative — the client only reports raw gameplay events; Cloud Code evaluates progress and mints every coupon.",
    },
  ];

  /* ── SKILL TOTEMS ───────────────────────────────── */
  const TOTEMS = [
    {
      type: 'totem', wx: 3800, h: 150, color: '#00d4ff', charge: 0, active: false,
      title: 'Game Engines', icon: '🎮',
      bars: [
        { label: 'Unity', tier: 'Primary', level: 5 },
        { label: 'Unreal Engine', tier: 'Working', level: 2 },
      ],
    },
    {
      type: 'totem', wx: 4100, h: 190, color: '#00ffa3', charge: 0, active: false,
      title: 'Programming Languages', icon: '💻',
      bars: [
        { label: 'C#', tier: 'Primary', level: 5 },
        { label: 'C++', tier: 'Advanced', level: 4 },
        { label: 'Python', tier: 'Proficient', level: 3 },
        { label: 'JavaScript', tier: 'Proficient', level: 3 },
        { label: 'Java', tier: 'Working', level: 2 },
      ],
    },
    {
      type: 'totem', wx: 4400, h: 165, color: '#a855f7', charge: 0, active: false,
      title: 'Specializations', icon: '🛠️',
      pills: ['Gameplay Mechanics', 'VR / XR Dev', 'Narrative Design', 'AI & Combat Systems', 'Multiplayer', 'Code Architecture'],
    },
    {
      type: 'totem', wx: 4620, h: 140, color: '#ff6b9d', charge: 0, active: false,
      title: 'Soft Skills', icon: '🧠',
      pills: ['Problem Solving', 'Teamwork', 'Time Management', 'Communication', 'Adaptability'],
    },
    {
      type: 'totem', wx: 3520, h: 175, color: '#f59e0b', charge: 0, active: false,
      title: 'IT & Infrastructure', icon: '🖥️',
      pills: ['Active Directory', 'Group Policy', 'DNS & DHCP', 'Exchange Server', 'WSUS', 'WDS', 'Hyper-V', 'NTFS Security', 'MikroTik Firewall', 'Bitdefender GravityZone'],
    },
  ];

  /* ── TROPHIES (certificates) ────────────────────── */
  const TROPHIES = [
    {
      type: 'cert', wx: 9450, found: false, color: '#ffd166', icon: '🎓',
      title: 'Diploma in Game Programming', issuer: 'Information Technology Institute (ITI)',
      period: 'Issued Jun 2024', skills: 'C++ · C# · Unity · Unreal · Game Programming',
      img: 'assets/certs/diploma-game-programming.jpg',
    },
    {
      type: 'cert', wx: 9750, found: false, color: '#00d4ff', icon: '🚀',
      title: '2024 NASA Space Apps Challenge', issuer: 'NASA',
      period: 'Issued Oct 2024', skills: 'Game Development · Project Management',
      img: 'assets/certs/nasa-space-apps-2024.jpg',
    },
    {
      type: 'cert', wx: 10050, found: false, color: '#a855f7', icon: '🏆',
      title: 'ACT 1: Rational Game Design', issuer: 'Ubisoft – Game Creators’ Odyssey',
      period: 'May 2024', skills: 'Credential ID 106197-00002-08651',
      img: 'assets/certs/ubisoft-act1-rational-game-design.jpg',
    },
    {
      type: 'cert', wx: 10350, found: false, color: '#a855f7', icon: '🏆',
      title: 'ACT 2: Rational Game Design', issuer: 'Ubisoft – Game Creators’ Odyssey',
      period: 'June 2024', skills: 'Credential ID 106197-00010-08672',
      img: 'assets/certs/ubisoft-act2-rational-game-design.jpg',
    },
  ];

  const BEACON = { wx: 11000, color: '#00d4ff', reached: false };

  const ALL_PLATFORMS = [...MILESTONES];

  /* ── STATE ──────────────────────────────────────── */
  let gameState = 'intro';
  let introAnim = 0;
  let introBtns = { start: null, skip: null };
  let W = 0, H = 0;
  let camX = 0;
  const logEntries = [];         // everything discovered, newest first
  const particles = [];
  let currentZone = ZONES[0];
  let zoneAnnounced = false;     // suppresses the zone toast for the spawn zone
  let running = false;

  const char = {
    wx: 70, wy: 0, vx: 0, vy: 0, w: 22, h: 34,
    onGround: false, facing: 1, frame: 0, frameTimer: 0,
    jumping: false, bounce: 0, sprinting: false,
  };

  const STARS = Array.from({ length: 420 }, (_, i) => ({
    wx: (i / 420) * WORLD_W + hash(i) * 60,
    yr: hash(i * 3.7),
    r:  hash(i * 5.1) * 1.5 + 0.3,
    a:  hash(i * 2.3) * 0.5 + 0.18,
    sp: hash(i * 7.9) * 0.22 + 0.05,
  }));

  /* ── HELPERS ────────────────────────────────────── */
  /* Deterministic pseudo-noise so scenery never shimmers between frames. */
  function hash(n) {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  }

  /* The ground sits a fixed-ish margin above the bottom of the window, and scenery is
     sized off sceneH rather than the window, so a tall monitor gets more sky instead
     of a stretched, empty-looking level. */
  function gndY()   { return H - Math.min(190, Math.max(96, H * 0.15)); }
  function sceneH() { return Math.min(gndY(), 620); }
  function platSurface(m) { return gndY() - m.elev; }
  function toScreen(wx)   { return wx - camX; }
  function hexRgb(h)      { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)].join(','); }
  function lerp(a, b, t)  { return a + (b - a) * t; }

  function mixHex(a, b, t) {
    const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
    const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
    return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], t)).toString(16).padStart(2, '0')).join('');
  }

  function zoneIndexAt(wx) {
    for (let i = ZONES.length - 1; i >= 0; i--) if (wx >= ZONES[i].from) return i;
    return 0;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /* ── RESIZE ─────────────────────────────────────── */
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  /* ── HUD REFERENCES ─────────────────────────────── */
  const hud = {
    zoneIdx:  document.getElementById('hud-zone-idx'),
    zoneName: document.getElementById('hud-zone-name'),
    gems:     document.getElementById('hud-gems'),
    trophies: document.getElementById('hud-trophies'),
    railFill: document.getElementById('hud-rail-fill'),
    railTicks: document.getElementById('hud-rail-ticks'),
    toasts:   document.getElementById('hud-toasts'),
    drawer:   document.getElementById('hud-drawer'),
    log:      document.getElementById('journey-info'),
    restart:  document.getElementById('hud-restart'),
    handle:   document.getElementById('hud-drawer-handle'),
  };

  (function buildTicks() {
    if (!hud.railTicks) return;
    hud.railTicks.innerHTML = ZONES.slice(1).map(z =>
      `<i class="hud-rail-tick" data-at="${z.from}" style="left:${(z.from / WORLD_W * 100).toFixed(2)}%"></i>`
    ).join('');
  }());

  function updateHud() {
    const zi = zoneIndexAt(char.wx);
    const zone = ZONES[zi];
    if (zone !== currentZone || !zoneAnnounced) {
      const isFirst = !zoneAnnounced;
      currentZone = zone;
      zoneAnnounced = true;
      if (hud.zoneIdx)  hud.zoneIdx.textContent = `ZONE ${zi + 1} / ${ZONES.length} · ${zone.sub}`;
      if (hud.zoneName) {
        hud.zoneName.textContent = zone.name;
        hud.zoneName.style.color = zone.accent;
      }
      if (!isFirst) toast('Zone', zone.name, zone.accent, '▶');
    }

    const prog = Math.min(1, char.wx / (WORLD_W - 300));
    if (hud.railFill) hud.railFill.style.width = (prog * 100).toFixed(2) + '%';
    if (hud.railTicks) {
      hud.railTicks.querySelectorAll('.hud-rail-tick').forEach(t => {
        t.classList.toggle('reached', char.wx >= Number(t.dataset.at));
      });
    }
  }

  function bumpStat(el, value, total) {
    if (!el) return;
    const b = el.querySelector('b');
    if (b && b.textContent !== String(value)) {
      b.textContent = value;
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    }
    if (total != null) el.lastChild.textContent = '/' + total;
  }

  function toast(label, title, color, icon) {
    if (!hud.toasts) return;
    const el = document.createElement('div');
    el.className = 'hud-toast';
    el.style.setProperty('--tc', color || '#00ffa3');
    el.innerHTML =
      `<span class="hud-toast-icon">${icon || '◆'}</span>` +
      `<span><span class="hud-toast-label">${escapeHtml(label)}</span><br>` +
      `<span class="hud-toast-title">${escapeHtml(title)}</span></span>`;
    hud.toasts.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  /* ── LOG DRAWER ─────────────────────────────────── */
  function careerCard(m) {
    return `
      <div class="jm-card" style="--mc:${m.color};--mc-rgb:${hexRgb(m.color)}">
        <div class="jm-left">
          <span class="jm-date">${escapeHtml(m.period)}</span>
          <h3 class="jm-title">${escapeHtml(m.title)}</h3>
          <span class="jm-company">${escapeHtml(m.company)}</span>
        </div>
        <p class="jm-desc">${escapeHtml(m.desc)}</p>
      </div>`;
  }

  function gameCard(g) {
    let links = '';
    if (g.links) {
      links = g.links.map(l =>
        `<a href="${l.href}" target="_blank" rel="noopener" class="jm-link ${l.cls}">${escapeHtml(l.label)}</a>`
      ).join('');
    } else if (g.gplay || g.appstore) {
      if (g.gplay)    links += `<a href="${g.gplay}" target="_blank" rel="noopener" class="jm-link jm-link-itch">▶ Google Play</a>`;
      if (g.appstore) links += `<a href="${g.appstore}" target="_blank" rel="noopener" class="jm-link jm-link-gh"> App Store</a>`;
    } else {
      if (g.steam)  links += `<a href="${g.steam}" target="_blank" rel="noopener" class="jm-link jm-link-steam">◆ Steam</a>`;
      if (g.itchio) links += `<a href="${g.itchio}" target="_blank" rel="noopener" class="jm-link jm-link-itch">🎮 itch.io</a>`;
      if (g.github) links += `<a href="${g.github}" target="_blank" rel="noopener" class="jm-link jm-link-gh">⬡ GitHub</a>`;
    }
    if (!links && g.note) links = `<span class="jm-note">${escapeHtml(g.note)}</span>`;

    return `
      <div class="jm-card jm-game-card${g.wip ? ' jm-wip' : ''}" style="--mc:${g.color};--mc-rgb:${hexRgb(g.color)}">
        <img class="jm-game-img" src="${g.coverImg}" alt="${escapeHtml(g.title)}" loading="lazy">
        <div class="jm-game-right">
          <div class="jm-left">
            <span class="jm-date">${escapeHtml(g.period)}</span>
            <h3 class="jm-title">${escapeHtml(g.title)}</h3>
            <span class="jm-company jm-tag">${escapeHtml(g.tag)}</span>${g.role ? `<span class="jm-role jm-role-${g.role === 'Freelance' ? 'freelance' : 'personal'}">${escapeHtml(g.role)}</span>` : ''}
          </div>
          <p class="jm-desc">${escapeHtml(g.desc)}</p>
          <div class="jm-links">${links}</div>
        </div>
      </div>`;
  }

  function totemCard(t) {
    const bars = (t.bars || []).map(b => {
      const pips = Array.from({ length: 5 }, (_, i) =>
        `<i class="jm-pip${i < b.level ? ' lit' : ''}"></i>`).join('');
      return `
      <div class="jm-meter-row"><span>${escapeHtml(b.label)}</span><span class="jm-tier">${escapeHtml(b.tier)}</span>
        <div class="jm-pips">${pips}</div>
      </div>`;
    }).join('');
    const pills = (t.pills || []).length
      ? `<div class="jm-pills">${t.pills.map(p => `<span>${escapeHtml(p)}</span>`).join('')}</div>`
      : '';
    return `
      <div class="jm-card" style="--mc:${t.color};--mc-rgb:${hexRgb(t.color)}">
        <div class="jm-left">
          <span class="jm-date">Totem charged</span>
          <h3 class="jm-title">${t.icon} ${escapeHtml(t.title)}</h3>
        </div>
        ${bars ? `<div class="jm-meter">${bars}</div>` : ''}
        ${pills}
      </div>`;
  }

  function certCard(c) {
    return `
      <div class="jm-card jm-game-card" style="--mc:${c.color};--mc-rgb:${hexRgb(c.color)}">
        <img class="jm-game-img" src="${c.img}" alt="${escapeHtml(c.title)}" loading="lazy">
        <div class="jm-game-right">
          <div class="jm-left">
            <span class="jm-date">${escapeHtml(c.period)}</span>
            <h3 class="jm-title">${c.icon} ${escapeHtml(c.title)}</h3>
            <span class="jm-company">${escapeHtml(c.issuer)}</span>
          </div>
          <p class="jm-desc">${escapeHtml(c.skills)}</p>
        </div>
      </div>`;
  }

  function beaconCard() {
    return `
      <div class="jm-card" style="--mc:#00d4ff;--mc-rgb:0,212,255">
        <div class="jm-left">
          <span class="jm-date">End of the line</span>
          <h3 class="jm-title">📡 Signal Beacon</h3>
          <span class="jm-company">Nasr City, Cairo, Egypt</span>
        </div>
        <p class="jm-desc">Thanks for walking the whole thing. If any of it landed, the beacon is open — send a message.</p>
        <div class="jm-links">
          <a href="mailto:aafifi1988@icloud.com" class="jm-link jm-link-itch">✉ Email</a>
          <a href="https://www.linkedin.com/in/ahmedafifiabdou/" target="_blank" rel="noopener" class="jm-link jm-link-steam">🔗 LinkedIn</a>
          <a href="https://github.com/ahmedafifiabodu" target="_blank" rel="noopener" class="jm-link jm-link-gh">⬡ GitHub</a>
          <button type="button" class="jm-link jm-link-itch" data-exit-to="#contact">📝 Open contact form</button>
        </div>
      </div>`;
  }

  function cardFor(entry) {
    switch (entry.type) {
      case 'career': return careerCard(entry);
      case 'game':   return gameCard(entry);
      case 'totem':  return totemCard(entry);
      case 'cert':   return certCard(entry);
      case 'beacon': return beaconCard();
      default:       return '';
    }
  }

  function renderLog() {
    if (!hud.log) return;
    let html = '';

    if (logEntries.length === 0) {
      html += `<div class="hud-drawer-empty">
        <kbd>←</kbd> <kbd>→</kbd> walk &nbsp;·&nbsp; <kbd>Space</kbd> jump &nbsp;·&nbsp; <kbd>Shift</kbd> sprint<br>
        Land on a career pillar to read it.<br>
        Collect the spinning gems — each one is a project (dashed ones are still in development).<br>
        Stand by a totem to charge it, and walk the vault for trophies.<br>
        <kbd>Esc</kbd> leaves the game for the normal page.
      </div>`;
    }

    if (logEntries.length) {
      const gems = logEntries.filter(e => e.type === 'game').length;
      html += `<div class="jm-collected-header">
        <span class="jm-collected-label">Field Log <em>(${logEntries.length} found · ${gems}/${COLLECTABLES.length} projects)</em></span>
      </div><div class="jm-collected-list">`;
      for (const e of logEntries) html += cardFor(e);
      html += '</div>';
    }

    hud.log.innerHTML = html;
    hud.log.scrollTop = 0;

    const label = hud.handle?.querySelector('.hdh-label');
    if (label) label.textContent = logEntries.length ? `Log (${logEntries.length})` : 'Log';
  }

  function pushLog(entry) {
    logEntries.unshift(entry);
    renderLog();
  }

  hud.log?.addEventListener('click', e => {
    const btn = e.target.closest('[data-exit-to]');
    if (!btn) return;
    Mode?.exitTo(btn.dataset.exitTo);
  });

  hud.handle?.addEventListener('click', () => {
    const collapsed = hud.drawer.classList.toggle('collapsed');
    hud.handle.setAttribute('aria-expanded', String(!collapsed));
  });

  /* On a phone the drawer would cover the level, so it starts folded away — the
     toasts still announce anything you pick up. */
  if (hud.drawer && window.matchMedia('(max-width: 900px)').matches) {
    hud.drawer.classList.add('collapsed');
    hud.handle?.setAttribute('aria-expanded', 'false');
  }

  /* ── INPUT ──────────────────────────────────────── */
  const keys = {};
  const NAV_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];

  window.addEventListener('keydown', e => {
    if (!running) return;
    keys[e.code] = true;
    if (NAV_KEYS.includes(e.code) && !/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName)) e.preventDefault();
    if (e.code === 'Escape') Mode?.set('classic');
    if (e.code === 'KeyR')   resetGame();
    if (gameState === 'intro' && (e.code === 'Space' || e.code === 'Enter')) startGame();
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  let mLeft = false, mRight = false, mJump = false;

  function hitBtn(b, mx, my) {
    return b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
  }

  function pointerPos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener('click', e => {
    if (gameState !== 'intro') return;
    const p = pointerPos(e);
    if (hitBtn(introBtns.start, p.x, p.y)) { startGame(); return; }
    if (hitBtn(introBtns.skip,  p.x, p.y)) Mode?.set('classic');
  });

  canvas.addEventListener('mousemove', e => {
    if (gameState !== 'intro') { canvas.style.cursor = 'default'; return; }
    const p = pointerPos(e);
    canvas.style.cursor = (hitBtn(introBtns.start, p.x, p.y) || hitBtn(introBtns.skip, p.x, p.y)) ? 'pointer' : 'default';
  });

  canvas.addEventListener('touchstart', e => {
    if (gameState !== 'intro' || !e.touches.length) return;
    const r = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - r.left, y = e.touches[0].clientY - r.top;
    if (hitBtn(introBtns.start, x, y)) { e.preventDefault(); startGame(); }
    else if (hitBtn(introBtns.skip, x, y)) { e.preventDefault(); Mode?.set('classic'); }
  }, { passive: false });

  /* ── TOUCH CONTROLS ─────────────────────────────── */
  (function buildControls() {
    const wrap = document.getElementById('journey-controls');
    if (!wrap) return;
    wrap.innerHTML =
      '<button id="jbL" class="game-btn" aria-label="Move left">&#9664;</button>' +
      '<button id="jbJ" class="game-btn game-btn-jump" aria-label="Jump">&#9650; Jump</button>' +
      '<button id="jbR" class="game-btn" aria-label="Move right">&#9654;</button>';
    function bind(id, setter) {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', e => { e.preventDefault(); setter(true);  }, { passive: false });
      el.addEventListener('touchend',   e => { e.preventDefault(); setter(false); }, { passive: false });
      el.addEventListener('touchcancel', () => setter(false));
      el.addEventListener('mousedown',  () => setter(true));
      el.addEventListener('mouseup',    () => setter(false));
      el.addEventListener('mouseleave', () => setter(false));
    }
    bind('jbL', v => mLeft  = v);
    bind('jbR', v => mRight = v);
    bind('jbJ', v => mJump  = v);
  }());

  if (window.matchMedia('(pointer: coarse)').matches) document.body.classList.add('touch');

  hud.restart?.addEventListener('click', resetGame);

  /* ── LIFECYCLE ──────────────────────────────────── */
  const gameRoot = document.getElementById('game-root');
  gameRoot?.classList.add('is-intro');

  /* ?zone=5 drops you at the start of that zone — handy for linking someone straight
     to the part of the story they care about. */
  function requestedZone() {
    const n = Number(new URLSearchParams(location.search).get('zone'));
    return Number.isInteger(n) && n >= 1 && n <= ZONES.length ? ZONES[n - 1] : null;
  }

  function startGame() {
    gameState = 'playing';
    gameRoot?.classList.remove('is-intro');
    const z = requestedZone();
    if (z) {
      char.wx = z.from + 60;
      char.wy = gndY() - char.h;
      char.vy = 0;
      camX = Math.max(0, Math.min(WORLD_W - W, char.wx - W * 0.42));
      zoneAnnounced = false;
    }
    renderLog();
    updateHud();
  }

  function resetGame() {
    COLLECTABLES.forEach(c => { c.collected = false; });
    MILESTONES.forEach(m => { m.visited = false; });
    TOTEMS.forEach(t => { t.charge = 0; t.active = false; });
    TROPHIES.forEach(t => { t.found = false; });
    BEACON.reached = false;
    Object.assign(char, { wx: 70, wy: 0, vx: 0, vy: 0, onGround: false, jumping: false, bounce: 0, frame: 0, frameTimer: 0 });
    camX = 0;
    logEntries.length = 0;
    particles.length = 0;
    zoneAnnounced = false;
    bumpStat(hud.gems, 0, COLLECTABLES.length);
    bumpStat(hud.trophies, 0, TROPHIES.length);
    renderLog();
    updateHud();
  }

  function burst(wx, wy, color, n) {
    for (let i = 0; i < (n || 7); i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 80 + 30;
      particles.push({ wx, wy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, alpha: 1, color, life: 0.7 + Math.random() * 0.35 });
    }
  }

  /* ── UPDATE ─────────────────────────────────────── */
  let clock = 0;

  function update(dt) {
    clock += dt;

    const left  = keys['ArrowLeft']  || keys['KeyA'] || mLeft;
    const right = keys['ArrowRight'] || keys['KeyD'] || mRight;
    const jump  = keys['ArrowUp']    || keys['KeyW'] || keys['Space'] || mJump;
    char.sprinting = !!(keys['ShiftLeft'] || keys['ShiftRight']);

    const speed = SPEED * (char.sprinting ? SPRINT : 1);
    if (left)       { char.vx = -speed; char.facing = -1; }
    else if (right) { char.vx =  speed; char.facing =  1; }
    else            { char.vx *= 0.76; }

    if (jump && char.onGround) {
      char.vy = JUMP_VEL;
      char.onGround = false;
      char.jumping = true;
    }

    char.vy += GRAVITY * dt;
    char.wx += char.vx * dt;
    char.wy += char.vy * dt;
    char.wx = Math.max(10, Math.min(WORLD_W - char.w - 10, char.wx));

    const gY = gndY();
    char.onGround = false;

    if (char.wy + char.h >= gY) {
      if (char.jumping) { burst(char.wx + char.w / 2, gY, currentZone.accent); char.bounce = 0.28; char.jumping = false; }
      char.wy = gY - char.h; char.vy = 0; char.onGround = true;
    }

    for (const m of ALL_PLATFORMS) {
      const py = platSurface(m);
      if (char.vy >= 0
        && char.wy + char.h >= py
        && char.wy + char.h <= py + 30
        && char.wx + char.w > m.wx + 2
        && char.wx < m.wx + m.w - 2) {
        if (char.jumping) { burst(char.wx + char.w / 2, py, m.color); char.bounce = 0.28; char.jumping = false; }
        char.wy = py - char.h; char.vy = 0; char.onGround = true;
        if (!m.visited) {
          m.visited = true;
          burst(char.wx + char.w / 2, py, m.color, 16);
          pushLog(m);
          toast('Milestone', `${m.title} · ${m.company}`, m.color, '★');
        }
      }
    }

    /* gems */
    for (const c of COLLECTABLES) {
      if (c.collected) continue;
      const cy = gndY() - c.elevBase + Math.sin(clock * 1.8 + c.offset) * 7;
      if (Math.abs((char.wx + char.w / 2) - c.wx) < 32 && Math.abs((char.wy + char.h / 2) - cy) < 38) {
        c.collected = true;
        burst(c.wx, cy, c.color, 26);
        pushLog(c);
        bumpStat(hud.gems, COLLECTABLES.filter(g => g.collected).length);
        toast('Game collected', c.title, c.color, '◆');
      }
    }

    /* totems charge while you stand near them — sprinting straight past skips them */
    for (const t of TOTEMS) {
      if (t.active) continue;
      const near = Math.abs((char.wx + char.w / 2) - t.wx) < 120;
      if (near) {
        t.charge = Math.min(1, t.charge + dt * 2.0);
        if (t.charge >= 1) {
          t.active = true;
          burst(t.wx, gndY() - t.h, t.color, 24);
          pushLog(t);
          toast('Totem charged', t.title, t.color, t.icon);
        }
      } else {
        t.charge = Math.max(0, t.charge - dt * 1.4);
      }
    }

    /* trophies */
    for (const t of TROPHIES) {
      if (t.found) continue;
      if (Math.abs((char.wx + char.w / 2) - t.wx) < 62) {
        t.found = true;
        burst(t.wx, gndY() - 70, t.color, 20);
        pushLog(t);
        bumpStat(hud.trophies, TROPHIES.filter(x => x.found).length);
        toast('Trophy inspected', t.title, t.color, '🏆');
      }
    }

    /* beacon */
    if (!BEACON.reached && Math.abs((char.wx + char.w / 2) - BEACON.wx) < 110) {
      BEACON.reached = true;
      burst(BEACON.wx, gndY() - 180, BEACON.color, 30);
      pushLog({ type: 'beacon' });
      toast('Beacon reached', 'The signal is open', BEACON.color, '📡');
    }

    /* animation */
    if (Math.abs(char.vx) > 8 && char.onGround) {
      char.frameTimer += dt;
      const step = char.sprinting ? 0.07 : 0.1;
      if (char.frameTimer > step) { char.frameTimer = 0; char.frame = (char.frame + 1) % 4; }
    } else if (!char.onGround) {
      char.frame = 2;
    } else {
      char.frame = 0;
    }
    char.bounce = Math.max(0, char.bounce - dt * 3.5);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.wx += p.vx * dt; p.wy += p.vy * dt; p.vy += 460 * dt;
      p.alpha -= dt / p.life;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    const tx = char.wx + char.w / 2 - W * 0.42;
    camX += (tx - camX) * Math.min(1, dt * 8);
    camX = Math.max(0, Math.min(WORLD_W - W, camX));

    updateHud();
  }

  /* ── BACKGROUND ─────────────────────────────────── */
  function skyAt(wx) {
    const i = zoneIndexAt(wx);
    const z = ZONES[i];
    const next = ZONES[i + 1];
    if (!next) return { sky: z.sky, accent: z.accent };
    const band = 420;
    const d = z.to - wx;
    if (d > band) return { sky: z.sky, accent: z.accent };
    const t = 1 - d / band;
    return {
      sky: [mixHex(z.sky[0], next.sky[0], t), mixHex(z.sky[1], next.sky[1], t)],
      accent: mixHex(z.accent, next.accent, t),
    };
  }

  function drawSky() {
    const { sky } = skyAt(camX + W / 2);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, sky[0]);
    g.addColorStop(1, sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const gY = gndY(), sh = sceneH();
    for (const s of STARS) {
      const sx = s.wx - camX * s.sp;
      if (sx < -4 || sx > W + 4) continue;
      const tw = 0.75 + 0.25 * Math.sin(clock * 1.6 + s.wx);
      ctx.beginPath();
      ctx.arc(sx, gY - sh * (0.2 + s.yr * 0.95), s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${(s.a * tw).toFixed(3)})`;
      ctx.fill();
    }
  }

  /* Parallax scenery. Each zone paints only inside its own slice of the screen, so
     the scenery style changes exactly where the zone boundary sits on screen. */
  function drawDecor() {
    const gY = gndY(), sh = sceneH();
    const first = zoneIndexAt(camX);
    const last  = zoneIndexAt(camX + W);

    for (let zi = first; zi <= last; zi++) {
      const z = ZONES[zi];
      const painter = DECOR[z.decor];
      if (!painter) continue;

      const left  = Math.max(0, z.from - camX);
      const right = Math.min(W, z.to - camX);
      if (right <= left) continue;

      ctx.save();
      ctx.beginPath();
      ctx.rect(left, 0, right - left, gY);
      ctx.clip();
      painter(z, zi, hexRgb(z.accent), gY, sh);
      ctx.restore();
    }

    /* A lit gate on each boundary so the scenery swap reads as a doorway between
       zones instead of a clipping seam. */
    for (let zi = Math.max(1, first); zi <= last; zi++) {
      const z = ZONES[zi];
      const sx = z.from - camX;
      if (sx < -80 || sx > W + 80) continue;
      const rgb = hexRgb(z.accent);
      const g = ctx.createLinearGradient(sx - 70, 0, sx + 70, 0);
      g.addColorStop(0, `rgba(${rgb},0)`);
      g.addColorStop(0.5, `rgba(${rgb},0.16)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(sx - 70, gY - sh, 140, sh);

      ctx.save();
      ctx.shadowBlur = 18; ctx.shadowColor = z.accent;
      ctx.strokeStyle = `rgba(${rgb},0.5)`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx, gY); ctx.lineTo(sx, gY - sh * 0.62); ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${rgb},0.75)`;
      ctx.font = '10px "Share Tech Mono",monospace';
      ctx.fillText(z.name.toUpperCase(), sx, gY - sh * 0.62 - 10);
      ctx.restore();
    }
  }

  const DECOR = {
    city(z, zi, rgb, gY, sh) {
      for (const layer of [{ p: 0.28, h: 0.52, a: 0.16, w: 120 }, { p: 0.5, h: 0.34, a: 0.26, w: 90 }]) {
        const step = layer.w;
        const startWx = Math.floor((camX * layer.p) / step) * step;
        for (let i = 0; i < W / step + 3; i++) {
          const wx = startWx + i * step;
          const n = hash(wx * 0.013 + zi);
          const bh = (0.35 + n * 0.65) * sh * layer.h;
          const bw = step * (0.55 + hash(wx * 0.07) * 0.3);
          const sx = wx - camX * layer.p;
          ctx.fillStyle = `rgba(${rgb},${layer.a * 0.35})`;
          ctx.fillRect(sx, gY - bh, bw, bh);
          ctx.fillStyle = `rgba(${rgb},${layer.a})`;
          ctx.fillRect(sx, gY - bh, bw, 2);
          for (let wy = gY - bh + 12; wy < gY - 10; wy += 16) {
            if (hash(wx + wy) > 0.62) {
              ctx.fillStyle = `rgba(${rgb},${(0.3 + 0.25 * Math.sin(clock + wx + wy)).toFixed(2)})`;
              ctx.fillRect(sx + 6, wy, 4, 5);
              ctx.fillRect(sx + bw - 12, wy, 4, 5);
            }
          }
        }
      }
    },

    dunes(z, zi, rgb, gY, sh) {
      for (const layer of [{ p: 0.3, amp: 46, base: 0.28, a: 0.13 }, { p: 0.52, amp: 30, base: 0.16, a: 0.2 }]) {
        ctx.beginPath();
        ctx.moveTo(0, gY);
        for (let x = 0; x <= W; x += 12) {
          const wx = (x + camX * layer.p) * 0.01;
          const y = gY - sh * layer.base - Math.sin(wx * 1.7) * layer.amp - Math.sin(wx * 0.6) * layer.amp * 0.6;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, gY);
        ctx.closePath();
        ctx.fillStyle = `rgba(${rgb},${layer.a})`;
        ctx.fill();
      }
    },

    grid(z, zi, rgb, gY, sh) {
      ctx.save();
      ctx.strokeStyle = `rgba(${rgb},0.13)`;
      ctx.lineWidth = 1;
      const vanish = gY - sh * 0.5;
      for (let i = -12; i <= 12; i++) {
        const x = W / 2 + i * 90 - (camX * 0.45) % 90;
        ctx.beginPath(); ctx.moveTo(W / 2, vanish); ctx.lineTo(x * 2 - W / 2, gY); ctx.stroke();
      }
      for (let i = 1; i < 10; i++) {
        const t = i / 10;
        const y = vanish + (gY - vanish) * t * t;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      /* floating wireframe cubes */
      for (let i = 0; i < 8; i++) {
        const wx = z.from + 120 + i * 150;
        const sx = wx - camX * 0.7;
        if (sx < -60 || sx > W + 60) continue;
        const size = 14 + hash(i + zi) * 12;
        const y = gY - sh * 0.68 + Math.sin(clock * 0.8 + i) * 16;
        ctx.save();
        ctx.translate(sx, y);
        ctx.rotate(clock * 0.35 + i);
        ctx.strokeStyle = `rgba(${rgb},0.3)`;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      }
      ctx.restore();
    },

    pines(z, zi, rgb, gY, sh) {
      for (const layer of [{ p: 0.3, s: 2.1, a: 0.12, step: 70 }, { p: 0.55, s: 1.3, a: 0.22, step: 52 }]) {
        const startWx = Math.floor((camX * layer.p) / layer.step) * layer.step;
        for (let i = 0; i < W / layer.step + 3; i++) {
          const wx = startWx + i * layer.step;
          const sx = wx - camX * layer.p;
          const h = (46 + hash(wx * 0.02 + zi) * 46) * layer.s;
          ctx.fillStyle = `rgba(${rgb},${layer.a})`;
          ctx.beginPath();
          ctx.moveTo(sx, gY - h);
          ctx.lineTo(sx + h * 0.32, gY);
          ctx.lineTo(sx - h * 0.32, gY);
          ctx.closePath();
          ctx.fill();
        }
      }
      /* snow */
      for (let i = 0; i < 60; i++) {
        const sx = (hash(i * 3.3) * W + clock * (8 + hash(i) * 14)) % W;
        const sy = gY - sh + (hash(i * 7.7) * sh + clock * (18 + hash(i * 2) * 26)) % sh;
        ctx.fillStyle = `rgba(255,255,255,${(0.12 + hash(i * 5) * 0.2).toFixed(2)})`;
        ctx.fillRect(sx, sy, 2, 2);
      }
    },

    neon(z, zi, rgb, gY, sh) {
      const step = 130;
      const startWx = Math.floor((camX * 0.42) / step) * step;
      for (let i = 0; i < W / step + 3; i++) {
        const wx = startWx + i * step;
        const sx = wx - camX * 0.42;
        const bh = sh * (0.3 + hash(wx * 0.011 + zi) * 0.38);
        const bw = step * 0.6;
        ctx.fillStyle = `rgba(${rgb},0.08)`;
        ctx.fillRect(sx, gY - bh, bw, bh);
        ctx.strokeStyle = `rgba(${rgb},0.35)`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sx, gY - bh, bw, bh);
        ctx.save();
        ctx.shadowBlur = 12; ctx.shadowColor = z.accent;
        ctx.fillStyle = `rgba(${rgb},${(0.35 + 0.25 * Math.sin(clock * 1.4 + i)).toFixed(2)})`;
        ctx.fillRect(sx + 8, gY - bh + 8, bw - 16, 3);
        ctx.restore();
      }
    },

    vault(z, zi, rgb, gY, sh) {
      const step = 160;
      const startWx = Math.floor((camX * 0.4) / step) * step;
      for (let i = 0; i < W / step + 3; i++) {
        const wx = startWx + i * step;
        const sx = wx - camX * 0.4;
        const h = sh * 0.56;
        ctx.fillStyle = `rgba(${rgb},0.07)`;
        ctx.fillRect(sx, gY - h, 26, h);
        ctx.fillStyle = `rgba(${rgb},0.16)`;
        ctx.fillRect(sx - 5, gY - h, 36, 8);
        ctx.fillRect(sx - 5, gY - 10, 36, 10);
        ctx.beginPath();
        ctx.arc(sx + 13 + step / 2, gY - h, step / 2 - 20, Math.PI, 0);
        ctx.strokeStyle = `rgba(${rgb},0.12)`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    },

    space(z, zi, rgb, gY, sh) {
      const cy = gY - sh * 0.62;
      for (let i = 0; i < 4; i++) {
        const sx = (z.from + 200 + i * 260) - camX * 0.24;
        if (sx < -300 || sx > W + 300) continue;
        const g = ctx.createRadialGradient(sx, cy, 0, sx, cy, 190);
        g.addColorStop(0, `rgba(${rgb},0.12)`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(sx - 200, cy - 200, 400, 400);
      }
    },
  };

  function drawGround() {
    const gY = gndY();
    const { accent } = skyAt(camX + W / 2);
    ctx.fillStyle = '#05080e';
    ctx.fillRect(0, gY, W, H - gY);

    ctx.save();
    ctx.shadowBlur = 16; ctx.shadowColor = accent;
    ctx.strokeStyle = accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, gY); ctx.lineTo(W, gY); ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = `rgba(${hexRgb(accent)},0.06)`;
    ctx.lineWidth = 1;
    const tw = 48, to = camX % tw;
    for (let x = -to; x < W; x += tw) { ctx.beginPath(); ctx.moveTo(x, gY); ctx.lineTo(x, H); ctx.stroke(); }
  }

  /* ── WORLD OBJECTS ──────────────────────────────── */
  function drawPlatforms() {
    for (const m of ALL_PLATFORMS) {
      const sx = toScreen(m.wx);
      if (sx + m.w < -40 || sx > W + 40) continue;
      const py = platSurface(m);
      const rgb = hexRgb(m.color);

      if (m.elev > PLT_H) {
        const px = sx + m.w / 2 - 4;
        ctx.fillStyle = `rgba(${rgb},0.10)`;
        ctx.strokeStyle = `rgba(${rgb},0.22)`;
        ctx.lineWidth = 1;
        ctx.fillRect(px, py + PLT_H, 8, m.elev - PLT_H);
        ctx.strokeRect(px, py + PLT_H, 8, m.elev - PLT_H);
      }

      ctx.save();
      ctx.shadowBlur = 20; ctx.shadowColor = m.color;
      ctx.fillStyle = `rgba(${rgb},0.12)`;
      ctx.strokeStyle = m.color; ctx.lineWidth = 2;
      ctx.fillRect(sx, py, m.w, PLT_H);
      ctx.strokeRect(sx, py, m.w, PLT_H);
      ctx.restore();

      ctx.fillStyle = m.color;
      [[sx, py], [sx + m.w - 5, py]].forEach(([cx, cy]) => {
        ctx.fillRect(cx, cy, 5, 2); ctx.fillRect(cx, cy, 2, 5);
      });

      const dots = Math.floor(m.w / 24);
      for (let i = 0; i < dots; i++) {
        const alpha = 0.25 + 0.3 * Math.sin(clock * 2.5 + i * 1.4);
        ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(2)})`;
        ctx.fillRect(sx + 8 + i * 24, py + 5, 7, 3);
      }

      ctx.save();
      ctx.shadowBlur = 6; ctx.shadowColor = m.color;
      ctx.fillStyle = m.color;
      ctx.font = 'bold 12px "Share Tech Mono",monospace';
      ctx.textAlign = 'center';
      ctx.fillText(m.title, sx + m.w / 2, py - 20);
      ctx.fillStyle = 'rgba(180,210,255,0.6)';
      ctx.font = '10px "Share Tech Mono",monospace';
      ctx.fillText(m.company, sx + m.w / 2, py - 8);
      ctx.restore();
    }
  }

  function drawTotems() {
    const gY = gndY();
    for (const t of TOTEMS) {
      const sx = toScreen(t.wx);
      if (sx < -120 || sx > W + 120) continue;
      const rgb = hexRgb(t.color);
      const topY = gY - t.h;
      const lit = t.active ? 1 : t.charge;

      /* obelisk */
      ctx.save();
      ctx.fillStyle = `rgba(${rgb},${0.06 + lit * 0.14})`;
      ctx.strokeStyle = `rgba(${rgb},${0.3 + lit * 0.6})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 16, gY);
      ctx.lineTo(sx - 10, topY + 14);
      ctx.lineTo(sx, topY);
      ctx.lineTo(sx + 10, topY + 14);
      ctx.lineTo(sx + 16, gY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      /* charge column */
      const fillH = (t.h - 20) * lit;
      ctx.save();
      ctx.shadowBlur = 18 * lit; ctx.shadowColor = t.color;
      ctx.fillStyle = `rgba(${rgb},${0.28 + lit * 0.5})`;
      ctx.fillRect(sx - 5, gY - 8 - fillH, 10, fillH);
      ctx.restore();

      /* crown */
      if (t.active) {
        const pulse = 0.7 + 0.3 * Math.sin(clock * 3 + t.wx);
        ctx.save();
        ctx.translate(sx, topY - 18 + Math.sin(clock * 1.6 + t.wx) * 4);
        ctx.shadowBlur = 22 * pulse; ctx.shadowColor = t.color;
        ctx.strokeStyle = t.color; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + clock * 0.6;
          const px = Math.cos(a) * 12, py = Math.sin(a) * 12;
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.textAlign = 'center';
      ctx.shadowBlur = 6; ctx.shadowColor = t.color;
      ctx.fillStyle = t.active ? t.color : `rgba(${rgb},0.7)`;
      ctx.font = 'bold 11px "Share Tech Mono",monospace';
      ctx.fillText(t.title, sx, topY - 40);
      if (!t.active) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(180,210,255,0.5)';
        ctx.font = '9px "Share Tech Mono",monospace';
        ctx.fillText(t.charge > 0 ? `charging ${Math.round(t.charge * 100)}%` : 'stand here to charge', sx, topY - 28);
      }
      ctx.restore();
    }
  }

  function drawTrophies() {
    const gY = gndY();
    for (const t of TROPHIES) {
      const sx = toScreen(t.wx);
      if (sx < -110 || sx > W + 110) continue;
      const rgb = hexRgb(t.color);
      const pedH = 54;
      const bob = Math.sin(clock * 1.4 + t.wx) * 5;

      ctx.fillStyle = `rgba(${rgb},0.1)`;
      ctx.strokeStyle = `rgba(${rgb},${t.found ? 0.55 : 0.3})`;
      ctx.lineWidth = 2;
      ctx.fillRect(sx - 26, gY - pedH, 52, pedH);
      ctx.strokeRect(sx - 26, gY - pedH, 52, pedH);
      ctx.fillStyle = `rgba(${rgb},0.2)`;
      ctx.fillRect(sx - 32, gY - pedH - 7, 64, 7);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.shadowBlur = t.found ? 24 : 10;
      ctx.shadowColor = t.color;
      ctx.globalAlpha = t.found ? 1 : 0.55;
      ctx.font = '26px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
      ctx.fillText(t.icon, sx, gY - pedH - 22 + bob);
      ctx.restore();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = t.found ? t.color : `rgba(${rgb},0.55)`;
      ctx.font = 'bold 10px "Share Tech Mono",monospace';
      const words = t.title.split(' ');
      const mid = Math.ceil(words.length / 2);
      ctx.fillText(words.slice(0, mid).join(' '), sx, gY - pedH - 62 + bob);
      ctx.fillText(words.slice(mid).join(' '),    sx, gY - pedH - 50 + bob);
      ctx.restore();
    }
  }

  function drawBeacon() {
    const gY = gndY();
    const sx = toScreen(BEACON.wx);
    if (sx < -200 || sx > W + 200) return;
    const rgb = hexRgb(BEACON.color);
    const h = 210;

    ctx.save();
    ctx.strokeStyle = `rgba(${rgb},0.5)`;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(sx, gY); ctx.lineTo(sx, gY - h); ctx.stroke();
    for (let i = 1; i < 6; i++) {
      const y = gY - (h / 6) * i;
      const spread = 26 * (1 - i / 7);
      ctx.beginPath();
      ctx.moveTo(sx - spread, y + 14); ctx.lineTo(sx + spread, y);
      ctx.moveTo(sx + spread, y + 14); ctx.lineTo(sx - spread, y);
      ctx.strokeStyle = `rgba(${rgb},0.28)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    const pulse = 0.6 + 0.4 * Math.sin(clock * 2.2);
    ctx.save();
    ctx.shadowBlur = 30 * pulse; ctx.shadowColor = BEACON.color;
    ctx.fillStyle = BEACON.color;
    ctx.beginPath(); ctx.arc(sx, gY - h - 8, 7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    for (let i = 0; i < 3; i++) {
      const r = ((clock * 90 + i * 70) % 210);
      ctx.beginPath();
      ctx.arc(sx, gY - h - 8, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rgb},${(0.22 * (1 - r / 210)).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.save();
    ctx.textAlign = 'center';
    ctx.shadowBlur = 8; ctx.shadowColor = BEACON.color;
    ctx.fillStyle = BEACON.color;
    ctx.font = 'bold 14px "Share Tech Mono",monospace';
    ctx.fillText('SIGNAL BEACON', sx, gY - h - 34);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(180,210,255,0.6)';
    ctx.font = '10px "Share Tech Mono",monospace';
    ctx.fillText('Walk up to open the channel', sx, gY - h - 20);
    ctx.restore();
  }

  function drawCollectables() {
    for (const c of COLLECTABLES) {
      const sx = toScreen(c.wx);
      if (sx < -90 || sx > W + 90) continue;

      const rgb = hexRgb(c.color);
      const topY = gndY() - c.elevBase;

      if (c.collected) {
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = c.color;
        ctx.font = '10px "Share Tech Mono",monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✓', sx, topY - 4);
        ctx.strokeStyle = `rgba(${rgb},0.1)`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx, gndY()); ctx.lineTo(sx, topY); ctx.stroke();
        ctx.restore();
        continue;
      }

      const cy = topY + Math.sin(clock * 1.8 + c.offset) * 7;
      const pulse = 0.7 + 0.3 * Math.sin(clock * 2.5 + c.offset);
      const r = 13;

      ctx.save();
      ctx.shadowBlur = 4; ctx.shadowColor = c.color;
      ctx.strokeStyle = `rgba(${rgb},0.35)`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx, gndY()); ctx.lineTo(sx, topY + r); ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(sx, cy);
      ctx.rotate(clock * 0.9 + c.offset);
      ctx.shadowBlur = 20 * pulse; ctx.shadowColor = c.color;
      ctx.strokeStyle = c.color; ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.78 * pulse;
      ctx.fillStyle = `rgba(${rgb},0.18)`;
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.lineTo(r * 0.65, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.65, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();

      /* Unreleased work gets a dashed orbit instead of a solid core, so a glance
         tells you it is still being built. */
      if (c.wip) {
        ctx.save();
        ctx.translate(sx, cy);
        ctx.rotate(-clock * 0.7 + c.offset);
        ctx.globalAlpha = 0.75 * pulse;
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 5]);
        ctx.beginPath(); ctx.arc(0, 0, r + 7, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(sx, cy);
        ctx.globalAlpha = 0.9 * pulse;
        ctx.shadowBlur = 10; ctx.shadowColor = c.color;
        ctx.fillStyle = c.color;
        ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.shadowBlur = 5; ctx.shadowColor = c.color;
      ctx.fillStyle = c.color;
      ctx.globalAlpha = 0.9;
      ctx.font = 'bold 10px "Share Tech Mono",monospace';
      ctx.textAlign = 'center';
      ctx.fillText(c.title, sx, cy - r - 12);
      ctx.fillStyle = `rgba(${rgb},0.7)`;
      ctx.font = '9px "Share Tech Mono",monospace';
      ctx.fillText(c.tag, sx, cy - r - 2);
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(toScreen(p.wx), p.wy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawChar() {
    if (char.sprinting && char.onGround && Math.abs(char.vx) > 100 && Math.random() > 0.55) {
      particles.push({
        wx: char.wx + char.w / 2, wy: char.wy + char.h - 2,
        vx: -char.facing * 40, vy: -20, alpha: 0.5,
        color: currentZone.accent, life: 0.35,
      });
    }
    drawCharPixel(toScreen(char.wx) + char.w / 2, char.wy + char.h, char.facing, char.frame, char.jumping, 1.4);
  }

  function drawCharPixel(cx, cy, facing, frame, jumping, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(facing * scale, scale);

    /* Darkened aura — the sprite shares its palette with several zone accents, so it
       needs its own pocket of contrast to stay readable against busy scenery. */
    const aura = ctx.createRadialGradient(0, -22, 6, 0, -22, 40);
    aura.addColorStop(0, 'rgba(2,4,8,0.8)');
    aura.addColorStop(0.6, 'rgba(2,4,8,0.45)');
    aura.addColorStop(1, 'rgba(2,4,8,0)');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(0, -22, 40, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse(0, 3, 11, 4, 0, 0, Math.PI * 2); ctx.fill();

    const legAnim = [[0, 0], [5, -3], [0, 0], [-5, -3]];
    const la = jumping ? [0, 0] : legAnim[frame % 4];
    ctx.fillStyle = '#1a2744';
    if (jumping) {
      ctx.fillRect(-9, -16, 8, 10); ctx.fillRect(1, -16, 8, 10);
    } else {
      ctx.fillRect(-9 + la[0], -16, 8, 16 + Math.max(0, la[1]));
      ctx.fillRect(1 - la[0], -16, 8, 16 - Math.min(0, la[1]));
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
      ctx.fillRect(9, -30 - armSwing, 5, 10);
    }

    ctx.fillStyle = '#ffd166'; ctx.fillRect(-7, -45, 14, 13);
    ctx.fillStyle = '#221500'; ctx.fillRect(-7, -45, 14, 4);
    ctx.fillStyle = '#111';
    ctx.fillRect(-3, -39, 3, 3); ctx.fillRect(3, -39, 3, 3);
    ctx.fillStyle = '#00ffa3';
    ctx.fillRect(-2, -38, 1, 1); ctx.fillRect(4, -38, 1, 1);

    ctx.restore();
  }

  /* ── INTRO ──────────────────────────────────────── */
  function drawIntro() {
    const t = introAnim;
    const narrow = W < 620;

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#04060a'); g.addColorStop(1, '#0c1020');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(0,255,163,0.03)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    for (const s of STARS) {
      const sx = (s.wx * 0.31) % W;
      ctx.beginPath(); ctx.arc(sx, s.yr * H * 0.8, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`; ctx.fill();
    }

    const pulse = 0.88 + 0.12 * Math.sin(t * 1.8);

    /* Compose inside a fixed-height band centred in the window so the title block
       stays together on both short laptops and tall monitors. */
    const bandH = narrow ? 520 : 470;
    const top = Math.max(24, (H - bandH) / 2);
    const y = o => top + o;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(136,146,164,0.7)';
    ctx.font = `${narrow ? 11 : 13}px "Share Tech Mono",monospace`;
    ctx.fillText('AHMED AFIFI — GAME PROGRAMMER', W / 2, y(30));

    ctx.shadowBlur = 30 * pulse; ctx.shadowColor = '#00ffa3';
    ctx.fillStyle = '#00ffa3';
    ctx.font = `bold ${Math.max(24, Math.min(56, Math.round(W * (narrow ? 0.072 : 0.042))))}px "Share Tech Mono",monospace`;
    ctx.fillText('THE PORTFOLIO RUN', W / 2, y(80));
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,163,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - (narrow ? 110 : 170), y(104));
    ctx.lineTo(W / 2 + (narrow ? 110 : 170), y(104));
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(136,146,164,0.75)';
    ctx.font = `${narrow ? 10 : 12}px "Share Tech Mono",monospace`;
    ctx.fillText(`Eight zones · 2013 to today · ${COLLECTABLES.length} projects to collect`, W / 2, y(136));
    ctx.fillText('← → move  ·  Space jump  ·  Shift sprint  ·  Esc exits', W / 2, y(160));

    drawCharPixel(W / 2, y(280) + Math.sin(t * 1.4) * 5, 1, 0, false, narrow ? 1.6 : 2.1);

    const btnW = narrow ? Math.min(260, W * 0.78) : 230;
    const btnH = 50;
    const gap = 16;
    const by = y(narrow ? 330 : 340);
    const bx1 = narrow ? (W / 2 - btnW / 2) : (W / 2 - btnW - gap / 2);
    const bx2 = narrow ? (W / 2 - btnW / 2) : (W / 2 + gap / 2);
    const by2 = narrow ? by + btnH + gap : by;

    introBtns.start = { x: bx1, y: by,  w: btnW, h: btnH };
    introBtns.skip  = { x: bx2, y: by2, w: btnW, h: btnH };

    ctx.save();
    ctx.shadowBlur = 20 * pulse; ctx.shadowColor = '#00ffa3';
    ctx.fillStyle = '#00ffa3';
    ctx.beginPath(); ctx.roundRect(bx1, by, btnW, btnH, 6); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#04060a';
    ctx.font = 'bold 16px "Share Tech Mono",monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▶  PRESS START', bx1 + btnW / 2, by + btnH * 0.62);

    ctx.save();
    ctx.strokeStyle = 'rgba(136,146,164,0.35)'; ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath(); ctx.roundRect(bx2, by2, btnW, btnH, 6); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = 'rgba(136,146,164,0.7)';
    ctx.font = '14px "Share Tech Mono",monospace';
    ctx.fillText('📄  Read as a page', bx2 + btnW / 2, by2 + btnH * 0.62);
  }

  /* ── LOOP ───────────────────────────────────────── */
  let lastTs = 0;
  let rafId = null;

  function frame(ts) {
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (gameState === 'intro') {
      introAnim += dt;
      clock += dt;
      drawIntro();
    } else {
      update(dt);
      drawSky();
      drawDecor();
      drawGround();
      drawPlatforms();
      drawTotems();
      drawTrophies();
      drawBeacon();
      drawCollectables();
      drawParticles();
      drawChar();
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    resize();
    lastTs = performance.now();
    rafId = requestAnimationFrame(ts => { lastTs = ts; frame(ts); });
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    for (const k in keys) keys[k] = false;
    mLeft = mRight = mJump = false;
  }

  renderLog();

  if (Mode) {
    Mode.onChange(mode => { mode === 'game' ? start() : stop(); });
    if (Mode.current === 'game') start();
  } else {
    start();
  }
}());
