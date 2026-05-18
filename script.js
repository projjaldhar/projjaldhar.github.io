'use strict';

/* ============================================================
   NAV — scrolled shadow
   ============================================================ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* Smooth scroll for anchor links */
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
   HERO — cycling heading
   ============================================================ */
const heroAnimated = document.getElementById('heroAnimated');
if (heroAnimated) {
  const phrases = ['Product Owner.', 'AI Builder.', 'Problem Solver.', 'Outcome Driver.'];
  let idx = 0;
  setInterval(() => {
    heroAnimated.classList.add('swapping');
    setTimeout(() => {
      idx = (idx + 1) % phrases.length;
      heroAnimated.textContent = phrases[idx];
      heroAnimated.classList.remove('swapping');
    }, 350);
  }, 3000);
}

/* ============================================================
   REVEAL — fade-in on scroll
   ============================================================ */
const triggered = new WeakSet();

function revealEl(el, delay) {
  if (triggered.has(el)) return;
  triggered.add(el);
  revealObserver.unobserve(el);
  setTimeout(() => el.classList.add('visible'), delay || 0);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting || triggered.has(entry.target)) return;
    const el = entry.target;
    /* stagger siblings that aren't triggered yet */
    const siblings = Array.from(el.parentElement.querySelectorAll(':scope > .fade-in'))
      .filter(s => !triggered.has(s));
    if (siblings.length > 1) {
      siblings.forEach((s, i) => revealEl(s, i * 75));
    } else {
      revealEl(el, 0);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));

/* ============================================================
   COUNTERS — animate on viewport entry
   ============================================================ */
function animateCounter(el, end, suffix) {
  const duration = 900;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * end) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting || entry.target.dataset.counted) return;
    const el = entry.target;
    el.dataset.counted = 'true';
    animateCounter(el, parseInt(el.dataset.purecounterEnd, 10), el.dataset.purecounterSuffix || '');
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-purecounter-end]').forEach(el => counterObs.observe(el));

/* ============================================================
   TAB SWITCHER
   ============================================================ */
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

function activateTab(id) {
  tabBtns.forEach(b => {
    const on = b.dataset.tab === id;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on);
  });
  tabPanels.forEach(p => p.classList.toggle('hidden', p.id !== 'tab-' + id));
}

tabBtns.forEach(b => b.addEventListener('click', () => activateTab(b.dataset.tab)));
if (window.location.hash === '#projects') activateTab('dev');
document.querySelectorAll('a[href="#projects"]').forEach(l => l.addEventListener('click', () => activateTab('dev')));
