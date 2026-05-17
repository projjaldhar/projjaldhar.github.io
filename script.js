'use strict';

/* ============================================================
   FADE-IN — Staggered Intersection Observer
   ============================================================ */

// Word-by-word reveal for elements with data-words attribute
function wrapWords(html) {
  // Wrap each word token (non-whitespace, non-tag) in a .word-reveal span
  return html.replace(/(<[^>]+>)|([^\s<]+)/g, (match, tag, word) => {
    if (tag) return tag; // preserve HTML tags unchanged
    return `<span class="word-reveal">${word}</span>`;
  });
}

function revealWords(el) {
  // Cancel the standard fade-in transform so element is immediately visible as a container
  el.style.opacity = '1';
  el.style.transform = 'none';
  el.style.transition = 'none';

  el.innerHTML = wrapWords(el.innerHTML);
  const words = el.querySelectorAll('.word-reveal');

  // Double rAF: let browser paint the hidden-word state, then animate
  requestAnimationFrame(() => requestAnimationFrame(() => {
    words.forEach((word, i) => {
      word.style.transitionDelay = `${i * 38}ms`;
      word.classList.add('visible');
    });
  }));
}

const triggered = new WeakSet();

const reveal = (el, delay = 0) => {
  if (triggered.has(el)) return;
  triggered.add(el);
  observer.unobserve(el);
  setTimeout(() => {
    if ('words' in el.dataset) {
      revealWords(el);
    } else {
      el.classList.add('visible');
    }
  }, delay);
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting || triggered.has(entry.target)) return;
    const el = entry.target;

    // Collect untriggered siblings to stagger together
    const siblings = [...el.parentElement.querySelectorAll(':scope > .fade-in')]
      .filter(s => !triggered.has(s));

    if (siblings.length > 1) {
      siblings.forEach((s, i) => reveal(s, i * 90));
    } else {
      reveal(el);
    }
  });
}, {
  threshold: 0.06,
  rootMargin: '0px 0px -20px 0px'
});

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ============================================================
   SMOOTH SCROLL — internal anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72; // nav height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   STAT COUNTER — animate numbers on first visibility
   ============================================================ */
function animateCounter(el, end, suffix) {
  const duration = 1200;
  const startTime = performance.now();
  const endVal = parseFloat(end);

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * endVal * 10) / 10;
    el.textContent = (Number.isInteger(current) ? current : current.toFixed(0)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statCards = document.querySelectorAll('.stat-card');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const numEl = entry.target.querySelector('.stat-number');
    if (!numEl || numEl.dataset.animated) return;
    numEl.dataset.animated = 'true';

    const raw = numEl.textContent.trim();           // e.g. "10+", "90%", "3"
    const suffix = raw.replace(/[0-9.]/g, '');      // "+", "%", ""
    const num = raw.replace(/[^0-9.]/g, '');        // "10", "90", "3"
    numEl.textContent = '0' + suffix;
    animateCounter(numEl, num, suffix);
    statObserver.unobserve(entry.target);
  });
}, { threshold: 0.4 });

statCards.forEach(card => statObserver.observe(card));

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

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

// Activate DEV tab when navigating to #projects
if (window.location.hash === '#projects') {
  activateTab('dev');
}

/* ============================================================
   HERO QUOTE — cycle through quotes with fade transition
   ============================================================ */
const quotes = [
  { text: "Fall in love with the problem, not the solution.", author: "Uri Levine" },
  { text: "The best products don't win. The best understood problems do.", author: "Marty Cagan" },
  { text: "If you are not embarrassed by the first version of your product, you've launched too late.", author: "Reid Hoffman" },
  { text: "Good product managers don't ask 'what should we build?' They ask 'what problem are we solving?'", author: "Teresa Torres" },
  { text: "Talk to users. Build what they want. Grow.", author: "Paul Graham" },
];

const quoteEl   = document.getElementById('heroQuote');
const authorEl  = document.getElementById('heroQuoteAuthor');

if (quoteEl && authorEl) {
  let current = 0;

  function setQuote(idx) {
    quoteEl.textContent  = quotes[idx].text;
    authorEl.textContent = '— ' + quotes[idx].author;
  }

  function cycleQuote() {
    quoteEl.classList.add('fade-out');
    authorEl.classList.add('fade-out');

    setTimeout(() => {
      current = (current + 1) % quotes.length;
      setQuote(current);
      quoteEl.classList.remove('fade-out');
      authorEl.classList.remove('fade-out');
    }, 500);
  }

  setQuote(0);
  setInterval(cycleQuote, 5000);
}

/* ============================================================
   IN SHORT — cycle through phrases with fade transition
   ============================================================ */
const inShortPhrases = [
  `Currently leading AI/ML, EV, and compliance features in the <span class="in-short-script">Verizon Connect Reveal</span> fleet platform`,
  `10+ years shipping B2B SaaS and OMS products across <span class="in-short-script">Verizon, Retail inMotion</span>, and IBM`,
  `Discovery, ideation, and roadmap — connecting <span class="in-short-script">user research</span> to engineering execution`,
];

const inShortEl = document.getElementById('inShortText');
if (inShortEl) {
  inShortEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  let inShortIdx = 0;

  setInterval(() => {
    // Fade out
    inShortEl.style.opacity = '0';
    inShortEl.style.transform = 'translateY(10px)';

    setTimeout(() => {
      // Swap content while invisible
      inShortIdx = (inShortIdx + 1) % inShortPhrases.length;
      inShortEl.innerHTML = inShortPhrases[inShortIdx];

      // Double rAF ensures browser paints the hidden state before fading in
      requestAnimationFrame(() => requestAnimationFrame(() => {
        inShortEl.style.opacity = '1';
        inShortEl.style.transform = 'translateY(0)';
      }));
    }, 500);
  }, 3500);
}

// Handle nav </DEV> link click
document.querySelectorAll('a[href="#projects"]').forEach(link => {
  link.addEventListener('click', () => {
    activateTab('dev');
  });
});
