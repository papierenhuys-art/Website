/* =========================================
   Drukkerij Van den Herik — JavaScript
   ========================================= */

// ——— Scroll-voortgangsbalk + navbar-status (elke pagina, rAF-gethrottled) ———
(function () {
  const voortgang = document.getElementById('scroll-voortgang');
  const navbar = document.querySelector('.navbar');
  let tikt = false;

  function bijScroll() {
    const y = window.scrollY || window.pageYOffset;
    const docHoogte = document.documentElement.scrollHeight - window.innerHeight;
    if (voortgang) {
      voortgang.style.transform = 'scaleX(' + (docHoogte > 0 ? Math.min(y / docHoogte, 1) : 0) + ')';
    }
    if (navbar) navbar.classList.toggle('navbar--gescrold', y > 10);
    tikt = false;
  }

  window.addEventListener('scroll', () => {
    if (!tikt) { tikt = true; requestAnimationFrame(bijScroll); }
  }, { passive: true });
  bijScroll();
})();

// ——— Mobiel hamburger-menu ———
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

if (hamburger && navMenu) {
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'nav-menu');
  hamburger.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    hamburger.setAttribute('aria-expanded', String(open));
  });

  // Sluit menu bij klik op een link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-label', 'Menu openen');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Sluit menu met Escape en geef focus terug aan de knop
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-label', 'Menu openen');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }
  });
}

// ——— Cookie-melding ———
(function() {
  if (localStorage.getItem('cookie-akkoord')) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-banner__inhoud">
      <p>Wij gebruiken functionele cookies om de website goed te laten werken. Er worden geen tracking- of advertentiecookies geplaatst.</p>
      <div class="cookie-banner__knoppen">
        <button class="knop knop--primair cookie-akkoord">Begrepen</button>
        <a href="privacy.html" class="cookie-meer">Meer info</a>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  setTimeout(() => banner.classList.add('cookie-banner--zichtbaar'), 300);

  banner.querySelector('.cookie-akkoord').addEventListener('click', () => {
    localStorage.setItem('cookie-akkoord', '1');
    banner.classList.remove('cookie-banner--zichtbaar');
    setTimeout(() => banner.remove(), 400);
  });
})();

// ——— Rustige fade-in op L1-pagina's (contact, privacy) ———
// (op pagina's met GSAP nemen de paginascripts dit over)
if (!window.gsap && 'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const elementen = document.querySelectorAll('.ct-reveal');

  elementen.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elementen.forEach(el => observer.observe(el));
}
