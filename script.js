const html         = document.documentElement;
const themeToggle  = document.getElementById('themeToggle');
const STORAGE_KEY  = 'theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

(function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(saved || getSystemTheme());
})();

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

document.getElementById('footerYear').textContent = new Date().getFullYear();

const phrases = [
  'Finding a girl',
  'Tired of everything',
  'I love moonie',
  'Watching Yuri ',
  'Creating Problems',
];

const typingEl = document.getElementById('typingText');

let phraseIndex = Math.floor(Math.random() * phrases.length);
let charIndex = 0;
let isDeleting = false;

function shuffle() {
  let next;
  do { next = Math.floor(Math.random() * phrases.length); }
  while (next === phraseIndex && phrases.length > 1);
  return next;
}

function tick() {
  const current = phrases[phraseIndex];
  if (!isDeleting) {
    charIndex++;
    typingEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      isDeleting = true;
      setTimeout(tick, 2000);
      return;
    }
    setTimeout(tick, 72);
  } else {
    charIndex--;
    typingEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = shuffle();
      setTimeout(tick, 380);
      return;
    }
    setTimeout(tick, 38);
  }
}

setTimeout(tick, 600);

const LANYARD_USER = '1356075369853223033';
const statusDot    = document.getElementById('statusDot');
const activityWrap = document.getElementById('activityWrap');
const activityCard = document.getElementById('activityCard');

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildSpotifyCard(spotify) {
  return `
    <div class="activity-icon">🎵</div>
    <div class="activity-detail">
      <strong>${escHtml(spotify.song)}</strong>
      <span>by ${escHtml(spotify.artist)} — Spotify</span>
    </div>`;
}

function buildActivityCard(activity) {
  const details = activity.details ? escHtml(activity.details) : '';
  const state   = activity.state   ? escHtml(activity.state)   : '';
  const sub     = [details, state].filter(Boolean).join(' · ');
  return `
    <div class="activity-icon">🎮</div>
    <div class="activity-detail">
      <strong>${escHtml(activity.name)}</strong>
      ${sub ? `<span>${sub}</span>` : ''}
    </div>`;
}

async function fetchLanyard() {
  try {
    const res  = await fetch(`https://api.lanyard.rest/v1/users/${LANYARD_USER}`);
    const json = await res.json();
    if (!json.success) return;

    const data = json.data;

    statusDot.className = 'status-dot ' + (data.discord_status || 'offline');
    statusDot.title     = data.discord_status || 'offline';

    if (data.listening_to_spotify && data.spotify) {
      activityCard.innerHTML = buildSpotifyCard(data.spotify);
      activityWrap.style.display = 'block';
      return;
    }

    const activity = (data.activities || []).find(a => a.type === 0);
    if (activity) {
      activityCard.innerHTML = buildActivityCard(activity);
      activityWrap.style.display = 'block';
      return;
    }

    activityWrap.style.display = 'none';
  } catch (err) {
    statusDot.className = 'status-dot offline';
    statusDot.title     = 'offline';
    console.warn('Lanyard fetch failed:', err);
  }
}

fetchLanyard();
setInterval(fetchLanyard, 30000);

function initReveal() {
  const targets = document.querySelectorAll(
    '.about-text, .about-pills, .stack-group, .project-card, .contact-card, .pill-group'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    const delay = i % 6;
    if (delay > 0) el.classList.add('reveal-delay-' + delay);
  });

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initReveal);

const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  },
  { threshold: 0.45 }
);

sections.forEach(s => sectionObserver.observe(s));

(async function initViewCounter() {
  const el    = document.getElementById('viewCounter');
  const count = document.getElementById('viewCount');
  const NS    = 'rishe-portfolio';
  const KEY   = 'views';

  try {
    const res  = await fetch(`https://api.counterapi.dev/v1/${NS}/${KEY}/up`);
    const json = await res.json();

    const n = json.count ?? 0;
    count.textContent = n >= 1000
      ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
      : n.toString();

    el.classList.add('loaded');
  } catch {
    count.textContent = '—';
    el.classList.add('loaded');
  }
})();
