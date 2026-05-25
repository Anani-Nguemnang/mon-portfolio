// ── Loader ────────────────────────────────────────────────────
(function () {
  const loader  = document.getElementById('loader');
  const bar     = document.getElementById('loaderBar');
  const percent = document.getElementById('loaderPercent');
  let current   = 0;

  // Simulation de progression sur 5 secondes exactes
  const steps = [
    { target: 20,  delay: 60  },  // 0→20  : 1 200ms
    { target: 50,  delay: 40  },  // 20→50 : 1 200ms
    { target: 75,  delay: 50  },  // 50→75 : 1 250ms
    { target: 95,  delay: 60  },  // 75→95 : 1 200ms
    { target: 100, delay: 30  },  // 95→100:   150ms
  ];

  function animateStep(stepIdx) {
    if (stepIdx >= steps.length) return;
    const { target, delay } = steps[stepIdx];

    const interval = setInterval(() => {
      if (current >= target) {
        clearInterval(interval);
        animateStep(stepIdx + 1);
        return;
      }
      current++;
      bar.style.width     = current + '%';
      percent.textContent = current + '%';
    }, delay);
  }

  animateStep(0);

  // Masquer après exactement 5 secondes
  setTimeout(() => {
    current = 100;
    bar.style.width     = '100%';
    percent.textContent = '100%';
    setTimeout(() => {
      loader.classList.add('hide');
      setTimeout(() => loader.remove(), 700);
    }, 300);
  }, 5000);
})();

// ── Navbar scroll effect ─────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  highlightNav();
});

// ── Mobile menu ──────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Active nav link on scroll ────────────────────────────────
function highlightNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 120;
  sections.forEach(sec => {
    const top    = sec.offsetTop;
    const height = sec.offsetHeight;
    const id     = sec.getAttribute('id');
    const link   = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active', scrollY >= top && scrollY < top + height);
    }
  });
}

// ── Typed text effect ────────────────────────────────────────
const phrases = [
  'Développeur Python',
  'Futur analyste en cybersécurité',
  'Passionné de bases de données',
  'Étudiant en Génie Informatique',
  'Créateur d\'applications GUI',
];
let pIdx = 0, cIdx = 0, deleting = false;
const typedEl = document.getElementById('typedText');

function typeLoop() {
  const phrase = phrases[pIdx];
  if (!deleting) {
    typedEl.textContent = phrase.slice(0, ++cIdx);
    if (cIdx === phrase.length) {
      deleting = true;
      setTimeout(typeLoop, 1800);
      return;
    }
  } else {
    typedEl.textContent = phrase.slice(0, --cIdx);
    if (cIdx === 0) {
      deleting = false;
      pIdx = (pIdx + 1) % phrases.length;
    }
  }
  setTimeout(typeLoop, deleting ? 45 : 80);
}
typeLoop();

// ── Scroll reveal ────────────────────────────────────────────
const revealEls = document.querySelectorAll(
  '.skill-category, .project-card, .about-grid, .contact-wrapper, .section-title'
);
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observer.observe(el));

// ── Skill bars animation ─────────────────────────────────────
const skillBars = document.querySelectorAll('.skill-fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.dataset.width + '%';
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
skillBars.forEach(bar => barObserver.observe(bar));

// ── Contact form ─────────────────────────────────────────────
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = '✓ Message envoyé !';
  btn.style.background = 'var(--green)';
  btn.style.borderColor = 'var(--green)';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.disabled = false;
    this.reset();
  }, 3000);
});
