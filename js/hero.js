/* =========================================
   Drukkerij Van den Herik — Premium scroll-ervaring
   GSAP + ScrollTrigger. Alleen geladen op de homepagina.

   - Gepinde hero die transformeert bij het scrollen
     (zoom, fade, blur, kaarten vliegen de diepte in)
   - Meerlaagse parallax door de hele pagina
   - Woord-voor-woord tekstopbouw gekoppeld aan scrub
   - Marquee en kaarten reageren op scrollsnelheid en -richting
   - Omkeerbare reveals: elementen komen én verdwijnen
   - Morfende achtergronden en gradient-sweeps
   - 60fps: alleen transform/opacity (+ 1x blur), scrub-smoothing
   - Respecteert prefers-reduced-motion, valt netjes terug zonder GSAP
   ========================================= */
(function () {
  'use strict';

  var beperkteBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fijnePointer = window.matchMedia('(pointer: fine)').matches;

  /* ——— Scroll-voortgangsbalk + navbar-status (framework-loos, altijd actief) ——— */
  var voortgang = document.getElementById('scroll-voortgang');
  var navbar = document.querySelector('.navbar');
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
    scrollTikt = false;
  }
  window.addEventListener('scroll', function () {
    if (!scrollTikt) { scrollTikt = true; requestAnimationFrame(bijScroll); }
  }, { passive: true });
  bijScroll();

  /* ——— Reveal-groepen voorbereiden ——— */
  document.querySelectorAll('.reveal-groep').forEach(function (groep) {
    Array.prototype.forEach.call(groep.children, function (kind) {
      kind.classList.add('reveal');
    });
  });

  function toonAlles() {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('reveal--zichtbaar');
      el.style.transitionDelay = '';
    });
  }

  /* ——— Terugval zonder GSAP (CDN geblokkeerd/offline) ——— */
  if (!window.gsap || !window.ScrollTrigger) {
    toonAlles();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('gsap-actief');

  /* ——— Beperkte beweging: alles direct zichtbaar, geen animaties ——— */
  if (beperkteBeweging) {
    toonAlles();
    return;
  }

  ScrollTrigger.config({ ignoreMobileResize: true });

  var hero = document.querySelector('.hero--premium');
  var heroInhoud = hero ? hero.querySelector('.hero__inhoud') : null;
  var heroAchtergrond = hero ? hero.querySelector('.hero__achtergrond') : null;
  var heroVisueel = hero ? hero.querySelector('.hero__visueel') : null;
  var watermerk = hero ? hero.querySelector('.hero__watermerk') : null;
  var scrollhint = hero ? hero.querySelector('.hero__scrollhint') : null;
  var kaarten = hero ? gsap.utils.toArray(hero.querySelectorAll('.zweef-kaart')) : [];

  var mm = gsap.matchMedia();

  /* =========================================================
     1. HERO — gepind en transformerend tijdens het scrollen
     ========================================================= */
  mm.add('(min-width: 981px)', function () {
    if (!hero) return;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=75%',
        scrub: 0.9,
        pin: true,
        anticipatePin: 1
      }
    });

    if (heroInhoud) {
      tl.to(heroInhoud, {
        yPercent: -14,
        scale: 0.94,
        opacity: 0,
        filter: 'blur(9px)',
        ease: 'none'
      }, 0);
    }
    if (heroAchtergrond) {
      tl.to(heroAchtergrond, { scale: 1.12, ease: 'none' }, 0);
    }
    if (watermerk) {
      tl.to(watermerk, { rotation: -15, yPercent: 12, ease: 'none' }, 0);
    }
    if (scrollhint) {
      tl.to(scrollhint, { opacity: 0, ease: 'none' }, 0);
    }
    /* De zwevende kaarten vliegen elk hun eigen kant op, op basis van diepte */
    kaarten.forEach(function (kaart, i) {
      var diepte = parseFloat(kaart.dataset.diepte || 0.5);
      var richting = i % 2 ? 1 : -1;
      tl.to(kaart, {
        xPercent: richting * 55 * diepte,
        yPercent: -85 * diepte,
        rotation: richting * 9 * diepte,
        opacity: 0,
        ease: 'none'
      }, 0);
    });
  });

  /* Op tablet/mobiel: geen pin, wel een lichte fade-out van de hero */
  mm.add('(max-width: 980px)', function () {
    if (!hero || !heroInhoud) return;
    gsap.to(heroInhoud, {
      y: -40,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom 40%',
        scrub: true
      }
    });
  });

  /* ——— Hero: muis-parallax + cursor-spotlight (alleen desktop) ——— */
  if (hero && fijnePointer) {
    var kaartQuickTos = kaarten.map(function (kaart) {
      return {
        diepte: parseFloat(kaart.dataset.diepte || 0.5),
        naarX: gsap.quickTo(kaart, 'x', { duration: 0.7, ease: 'power3' }),
        naarY: gsap.quickTo(kaart, 'y', { duration: 0.7, ease: 'power3' })
      };
    });

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      var ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      kaartQuickTos.forEach(function (k) {
        k.naarX(nx * 26 * k.diepte);
        k.naarY(ny * 20 * k.diepte);
      });
      hero.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      hero.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
      hero.classList.add('spot-actief');
    });

    hero.addEventListener('mouseleave', function () {
      kaartQuickTos.forEach(function (k) { k.naarX(0); k.naarY(0); });
      hero.classList.remove('spot-actief');
    });
  }

  /* =========================================================
     2. SCROLLSNELHEID — marquee en kaarten reageren live
     ========================================================= */
  var ruweSnelheid = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: function (self) { ruweSnelheid = self.getVelocity(); }
  });

  /* Marquee draait mee met de scrollrichting en versnelt bij snel scrollen */
  var marqueeBaan = document.querySelector('.usp-marquee__baan');
  var marqueeTween = null;
  if (marqueeBaan) {
    marqueeTween = gsap.to(marqueeBaan, {
      xPercent: -50,
      duration: 38,
      ease: 'none',
      repeat: -1
    });
  }

  /* Rasters hellen subtiel mee met de scrollsnelheid (skew) */
  var skewDoelen = gsap.utils.toArray('.diensten-raster, .reveal-groep').map(function (el) {
    return gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' });
  });

  var gladdeSnelheid = 0;
  var marqueeTS = 1;
  gsap.ticker.add(function () {
    ruweSnelheid += (0 - ruweSnelheid) * 0.08; /* verval als het scrollen stopt */
    gladdeSnelheid += (ruweSnelheid - gladdeSnelheid) * 0.1;

    if (marqueeTween) {
      var doelTS = gsap.utils.clamp(-3.5, 4.5, 1 + gladdeSnelheid / 900);
      marqueeTS += (doelTS - marqueeTS) * 0.08;
      marqueeTween.timeScale(marqueeTS);
    }

    var skewDoel = gsap.utils.clamp(-3.5, 3.5, gladdeSnelheid / 400);
    skewDoelen.forEach(function (naarSkew) { naarSkew(skewDoel); });
  });

  /* =========================================================
     3. REVEALS — elegant in beeld, en weer weg bij terugscrollen
     ========================================================= */
  var onthullers = gsap.utils.toArray('.reveal');

  /* Elementen met woord-opbouw niet dubbel animeren */
  var woordElementen = gsap.utils.toArray('[data-woorden]');
  woordElementen.forEach(function (el) {
    el.classList.remove('reveal');
    onthullers = onthullers.filter(function (o) { return o !== el; });
  });

  gsap.set(onthullers, { y: 44, opacity: 0 });

  ScrollTrigger.batch(onthullers, {
    start: 'top 88%',
    onEnter: function (batch) {
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.09,
        overwrite: true,
        onComplete: function () {
          /* transform vrijgeven zodat CSS-hovereffecten weer werken */
          gsap.set(batch, { clearProps: 'transform' });
        }
      });
    },
    onLeaveBack: function (batch) {
      gsap.to(batch, { y: 36, opacity: 0, duration: 0.45, ease: 'power2.in', overwrite: true });
    }
  });

  /* =========================================================
     4. TEKST — woord voor woord opgebouwd, gekoppeld aan scroll
     ========================================================= */
  woordElementen.forEach(function (el) {
    var woorden = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    woorden.forEach(function (woord, i) {
      var span = document.createElement('span');
      span.className = 'bouw-woord';
      span.textContent = woord;
      el.appendChild(span);
      if (i < woorden.length - 1) el.appendChild(document.createTextNode(' '));
    });

    gsap.fromTo(el.querySelectorAll('.bouw-woord'),
      { opacity: 0.12 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.05,
        scrollTrigger: {
          trigger: el,
          start: 'top 84%',
          end: 'top 38%',
          scrub: 0.6
        }
      }
    );
  });

  /* =========================================================
     5. PARALLAX-LAGEN — de pagina beweegt als één verhaal
     ========================================================= */

  /* Elke sectie-inhoud drijft licht tegen de scroll in */
  gsap.utils.toArray('.sectie > .container').forEach(function (inhoud) {
    gsap.fromTo(inhoud,
      { y: 34 },
      {
        y: -26,
        ease: 'none',
        scrollTrigger: {
          trigger: inhoud.parentNode,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6
        }
      }
    );
  });

  /* Het feiten-raster (1961 / 90% / 30+ / FSC) zweeft dieper dan de tekst ernaast */
  var feitenRaster = document.querySelector('.sectie--grijs .reveal-groep');
  if (feitenRaster) {
    gsap.fromTo(feitenRaster,
      { y: 70 },
      {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: feitenRaster.closest('.sectie'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8
        }
      }
    );
  }

  /* =========================================================
     6. ACHTERGRONDEN — morphen mee met de scrollpositie
     ========================================================= */
  gsap.utils.toArray('.sectie--grijs').forEach(function (sectie) {
    gsap.fromTo(sectie,
      { backgroundColor: '#f4f7fc' },
      {
        backgroundColor: '#e7eefb',
        ease: 'none',
        scrollTrigger: {
          trigger: sectie,
          start: 'top 75%',
          end: 'bottom 25%',
          scrub: true
        }
      }
    );
  });

  /* CTA: het gradient schuift langzaam door terwijl je scrolt */
  var cta = document.querySelector('.cta-sectie');
  if (cta) {
    gsap.set(cta, { backgroundSize: '220% 220%' });
    gsap.fromTo(cta,
      { backgroundPosition: '0% 50%' },
      {
        backgroundPosition: '100% 50%',
        ease: 'none',
        scrollTrigger: {
          trigger: cta,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  }

  /* Footer schuift elegant omhoog in beeld */
  var footerInhoud = document.querySelector('.footer .container');
  if (footerInhoud) {
    gsap.from(footerInhoud, {
      y: 48,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.footer',
        start: 'top 92%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  /* =========================================================
     7. TELLERS — tellen omhoog zodra ze in beeld komen
     ========================================================= */
  gsap.utils.toArray('[data-teller]').forEach(function (el) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: function () {
        var doel = parseFloat(el.dataset.teller);
        var start = parseFloat(el.dataset.start || 0);
        var achtervoegsel = el.dataset.achtervoegsel || '';
        var teller = { w: start };
        gsap.to(teller, {
          w: doel,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = Math.round(teller.w) + achtervoegsel;
          }
        });
      }
    });
  });

  /* =========================================================
     8. MICRO-INTERACTIES — magnetische hero-knoppen
     ========================================================= */
  if (fijnePointer) {
    document.querySelectorAll('.knop--hero-primair, .knop--hero-omlijnd').forEach(function (knop) {
      var naarX = gsap.quickTo(knop, 'x', { duration: 0.4, ease: 'power3' });
      var naarY = gsap.quickTo(knop, 'y', { duration: 0.4, ease: 'power3' });
      knop.addEventListener('mousemove', function (e) {
        var rect = knop.getBoundingClientRect();
        naarX((e.clientX - rect.left - rect.width / 2) * 0.18);
        naarY((e.clientY - rect.top - rect.height / 2) * 0.22);
      });
      knop.addEventListener('mouseleave', function () {
        naarX(0);
        naarY(0);
      });
    });
  }
})();
