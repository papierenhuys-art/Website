/* =========================================
   Drukkerij Van den Herik — Premium hero & scroll-ervaring
   Alleen geladen op de homepagina.
   Performant: uitsluitend transform/opacity, rAF-throttled,
   respecteert prefers-reduced-motion.
   ========================================= */
(function () {
  'use strict';

  var beperkteBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fijnePointer = window.matchMedia('(pointer: fine)').matches;

  /* ——— Scroll: voortgangsbalk, navbar-status, hero-parallax ——— */
  var voortgang = document.getElementById('scroll-voortgang');
  var navbar = document.querySelector('.navbar');
  var hero = document.querySelector('.hero--premium');
  var heroInhoud = hero ? hero.querySelector('.hero__inhoud') : null;
  var heroVisueel = hero ? hero.querySelector('.hero__visueel') : null;
  var scrollTikt = false;

  function bijScroll() {
    var y = window.scrollY || window.pageYOffset;
    var docHoogte = document.documentElement.scrollHeight - window.innerHeight;

    if (voortgang) {
      voortgang.style.transform = 'scaleX(' + (docHoogte > 0 ? Math.min(y / docHoogte, 1) : 0) + ')';
    }
    if (navbar) {
      navbar.classList.toggle('navbar--gescrold', y > 10);
    }
    if (hero && !beperkteBeweging) {
      var heroHoogte = hero.offsetHeight;
      if (y <= heroHoogte) {
        if (heroInhoud) {
          heroInhoud.style.transform = 'translate3d(0,' + (y * 0.16) + 'px,0)';
          heroInhoud.style.opacity = Math.max(0, 1 - y / (heroHoogte * 0.85));
        }
        if (heroVisueel) {
          heroVisueel.style.transform = 'translate3d(0,' + (y * 0.07) + 'px,0)';
        }
      }
    }
    scrollTikt = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTikt) {
      scrollTikt = true;
      requestAnimationFrame(bijScroll);
    }
  }, { passive: true });
  bijScroll();

  /* ——— Muis-parallax op de zwevende hero-kaarten ——— */
  if (hero && fijnePointer && !beperkteBeweging) {
    var kaarten = hero.querySelectorAll('.zweef-kaart');
    var doelX = 0, doelY = 0, huidigX = 0, huidigY = 0;
    var raf = null;

    function parallaxLoop() {
      huidigX += (doelX - huidigX) * 0.08;
      huidigY += (doelY - huidigY) * 0.08;
      kaarten.forEach(function (kaart) {
        var diepte = parseFloat(kaart.dataset.diepte || 0.5);
        kaart.style.transform =
          'translate3d(' + (huidigX * 26 * diepte) + 'px,' + (huidigY * 20 * diepte) + 'px,0)';
      });
      if (Math.abs(doelX - huidigX) > 0.001 || Math.abs(doelY - huidigY) > 0.001) {
        raf = requestAnimationFrame(parallaxLoop);
      } else {
        raf = null;
      }
    }

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      doelX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      doelY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(parallaxLoop);
    });

    hero.addEventListener('mouseleave', function () {
      doelX = 0;
      doelY = 0;
      if (!raf) raf = requestAnimationFrame(parallaxLoop);
    });
  }

  /* ——— Onthul-animaties bij het scrollen ——— */
  document.querySelectorAll('.reveal-groep').forEach(function (groep) {
    Array.prototype.forEach.call(groep.children, function (kind, i) {
      kind.classList.add('reveal');
      kind.style.transitionDelay = (i * 90) + 'ms';
    });
  });

  var onthullers = document.querySelectorAll('.reveal');
  if (beperkteBeweging || !('IntersectionObserver' in window)) {
    onthullers.forEach(function (el) {
      el.classList.add('reveal--zichtbaar');
      el.style.transitionDelay = '';
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('reveal--zichtbaar');
        revealObserver.unobserve(el);
        el.addEventListener('transitionend', function opruimen(e) {
          if (e.propertyName !== 'opacity') return;
          el.style.transitionDelay = '';
          el.removeEventListener('transitionend', opruimen);
        });
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    onthullers.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ——— Stagger toevoegen aan de dienst-kaarten (basis komt uit main.js) ——— */
  document.querySelectorAll('.diensten-raster > .dienst-kaart').forEach(function (kaart, i) {
    if (!kaart.style.transition) return;
    kaart.style.transitionDelay = (i * 100) + 'ms';
    kaart.addEventListener('transitionend', function opruimen(e) {
      if (e.propertyName !== 'opacity') return;
      kaart.style.transitionDelay = '';
      kaart.removeEventListener('transitionend', opruimen);
    });
  });

  /* ——— Tellers die omhoog tellen zodra ze in beeld komen ——— */
  var tellers = document.querySelectorAll('[data-teller]');
  if (tellers.length && !beperkteBeweging && 'IntersectionObserver' in window) {
    var tellerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tellerObserver.unobserve(entry.target);
        animeerTeller(entry.target);
      });
    }, { threshold: 0.5 });
    tellers.forEach(function (el) { tellerObserver.observe(el); });
  }

  function animeerTeller(el) {
    var doel = parseFloat(el.dataset.teller);
    var start = parseFloat(el.dataset.start || 0);
    var achtervoegsel = el.dataset.achtervoegsel || '';
    var duur = 1400;
    var t0 = null;
    function stap(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / duur, 1);
      p = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
      el.textContent = Math.round(start + (doel - start) * p) + achtervoegsel;
      if (p < 1) requestAnimationFrame(stap);
    }
    requestAnimationFrame(stap);
  }

  /* ——— Magnetische hero-knoppen ——— */
  if (fijnePointer && !beperkteBeweging) {
    document.querySelectorAll('.knop--hero-primair, .knop--hero-omlijnd').forEach(function (knop) {
      knop.addEventListener('mousemove', function (e) {
        var rect = knop.getBoundingClientRect();
        var dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        var dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        knop.style.transform = 'translate(' + (dx * 5) + 'px,' + (dy * 4) + 'px)';
      });
      knop.addEventListener('mouseleave', function () {
        knop.style.transform = '';
      });
    });
  }
})();
