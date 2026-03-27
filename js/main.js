/* =========================================
   Drukkerij Van der Herik — JavaScript
   ========================================= */

// ——— Mobiel hamburger-menu ———
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
  });

  // Sluit menu bij klik op een link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-label', 'Menu openen');
    });
  });
}

// ——— Contactformulier ———
const form    = document.getElementById('contact-formulier');
const succes  = document.getElementById('formulier-succes');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Eenvoudige client-side validatie
    const verplicht = form.querySelectorAll('[required]');
    let geldig = true;

    verplicht.forEach(veld => {
      veld.style.borderColor = '';
      if (!veld.value.trim() || (veld.type === 'checkbox' && !veld.checked)) {
        veld.style.borderColor = '#e53e3e';
        geldig = false;
      }
    });

    if (!geldig) {
      // Scroll naar eerste fout
      const eerste = form.querySelector('[required][style*="e53e3e"]');
      if (eerste) eerste.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simuleer versturen (geen echte backend)
    const knop = form.querySelector('button[type="submit"]');
    knop.disabled = true;
    knop.textContent = 'Bezig met versturen…';

    setTimeout(() => {
      form.reset();
      knop.disabled = false;
      knop.textContent = 'Verstuur bericht';
      if (succes) {
        succes.style.display = 'block';
        succes.classList.add('formulier-bericht--succes');
        succes.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { succes.style.display = 'none'; }, 6000);
      }
    }, 800);
  });

  // Herstel randkleur bij invullen
  form.querySelectorAll('input, textarea, select').forEach(veld => {
    veld.addEventListener('input', () => { veld.style.borderColor = ''; });
  });
}

// ——— Cookie-melding ———
(function() {
  if (localStorage.getItem('cookie-akkoord')) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-banner__inhoud">
      <p>🍪 Wij gebruiken functionele cookies om de website goed te laten werken. Er worden geen tracking- of advertentiecookies geplaatst.</p>
      <div class="cookie-banner__knoppen">
        <button class="knop knop--primair cookie-akkoord">Begrepen</button>
        <a href="#" class="cookie-meer">Meer info</a>
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

// ——— Scroll-animatie voor kaarten ———
if ('IntersectionObserver' in window) {
  const elementen = document.querySelectorAll(
    '.dienst-kaart, .team-kaart, .waarde-kaart, .tijdlijn-item, .teller'
  );

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
