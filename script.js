'use strict';

/* ============================================================
   NAV — scrolled class + smooth scroll
   ============================================================ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav ? 72 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   HERO ANIMATED HEADING — cycle phrases (jonprinz style)
   ============================================================ */
const heroAnimated = document.getElementById('heroAnimated');
if (heroAnimated) {
  const phrases = ['Product Owner.', 'AI Builder.', 'Problem Solver.', 'Outcome Driver.'];
  let phraseIdx = 0;

  setInterval(() => {
    heroAnimated.classList.add('swapping');
    setTimeout(() => {
      phraseIdx = (phraseIdx + 1) % phrases.length;
      heroAnimated.textContent = phrases[phraseIdx];
      heroAnimated.classList.remove('swapping');
    }, 400);
  }, 3000);
}

/* ============================================================
   REVEAL — scale3d scroll animations (jonprinz style)
   ============================================================ */
const triggered = new WeakSet();

const revealEl = (el, delay = 0) => {
  if (triggered.has(el)) return;
  triggered.add(el);
  revealObserver.unobserve(el);
  setTimeout(() => el.classList.add('visible'), delay);
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting || triggered.has(entry.target)) return;
    const el = entry.target;
    const siblings = [...el.parentElement.querySelectorAll(':scope > .fade-in')]
      .filter(s => !triggered.has(s));
    if (siblings.length > 1) {
      siblings.forEach((s, i) => revealEl(s, i * 80));
    } else {
      revealEl(el);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));

/* ============================================================
   STATS COUNTERS — animate on viewport entry
   ============================================================ */
function animateCounter(el, end, suffix) {
  const duration = 1000;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * end);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterEls = document.querySelectorAll('[data-purecounter-end]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting || entry.target.dataset.counted) return;
    const el = entry.target;
    el.dataset.counted = 'true';
    const end = parseInt(el.dataset.purecounterEnd, 10);
    const suffix = el.dataset.purecounterSuffix || '';
    animateCounter(el, end, suffix);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
counterEls.forEach(el => counterObserver.observe(el));

/* ============================================================
   TAB SWITCHER — Work / DEV projects
   ============================================================ */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

function activateTab(tabId) {
  tabBtns.forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive);
  });
  tabPanels.forEach(panel => {
    panel.classList.toggle('hidden', panel.id !== 'tab-' + tabId);
  });
}
tabBtns.forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));
if (window.location.hash === '#projects') activateTab('dev');

document.querySelectorAll('a[href="#projects"]').forEach(link => {
  link.addEventListener('click', () => activateTab('dev'));
});
