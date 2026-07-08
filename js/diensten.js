/* =========================================
   Drukkerij Van den Herik — Dienstenpagina scroll-ervaring
   GSAP + ScrollTrigger.

   - Gepinde hero met CMYK-drukwerklagen die uiteenschuiven
   - Statement-tekst bouwt woord voor woord op (scrub)
   - Zes dienst-hoofdstukken stapelen als kaarten over elkaar
   - Scènes zoomen langzaam uit en schuiven vanuit links/rechts in
   - Horizontaal scrollend productieproces (gepind, desktop)
   - Materialen-stalen met 3D-tilt richting de cursor
   - USP's verschijnen één voor één, tellers tellen omhoog
   - Index-rijen reageren op scrollsnelheid (skew)
   - Valt netjes terug zonder GSAP en bij prefers-reduced-motion
   ========================================= */
(function () {
  'use strict';

  var beperkteBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fijnePointer = window.matchMedia('(pointer: fine)').matches;

  /* ——— Scroll-voortgangsbalk + navbar (framework-loos) ——— */
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

  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('gsap-actief');

  if (beperkteBeweging) return;

  ScrollTrigger.config({ ignoreMobileResize: true });

  var mm = gsap.matchMedia();

  /* =========================================================
     1. HERO — CMYK-lagen schuiven uiteen tijdens het scrollen
     ========================================================= */
  var hero = document.querySelector('.dp-hero');
  var heroInhoud = document.querySelector('.dp-hero__inhoud');
  var lagen = gsap.utils.toArray('.dp-laag');

  mm.add('(min-width: 900px)', function () {
    if (!hero) return;
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=65%',
        scrub: 0.9,
        pin: true,
        anticipatePin: 1
      }
    });
    if (heroInhoud) {
      tl.to(heroInhoud, { yPercent: -12, scale: 0.95, opacity: 0, filter: 'blur(8px)', ease: 'none' }, 0);
    }
    lagen.forEach(function (laag, i) {
      var richting = i % 2 ? 1 : -1;
      tl.to(laag, {
        xPercent: richting * (14 + i * 8),
        yPercent: -(10 + i * 7),
        rotation: richting * (4 + i * 2),
        ease: 'none'
      }, 0);
    });
    tl.to('.dp-hero__scrollhint', { opacity: 0, ease: 'none' }, 0);
  });

  mm.add('(max-width: 899px)', function () {
    if (!hero || !heroInhoud) return;
    gsap.to(heroInhoud, {
      y: -36,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 45%', scrub: true }
    });
  });

  /* Muis-parallax op de inktlagen */
  if (hero && fijnePointer) {
    var laagQuickTos = lagen.map(function (laag, i) {
      return {
        f: (i + 1) * 7,
        naarX: gsap.quickTo(laag, 'x', { duration: 0.8, ease: 'power3' }),
        naarY: gsap.quickTo(laag, 'y', { duration: 0.8, ease: 'power3' })
      };
    });
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      var ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      laagQuickTos.forEach(function (l) { l.naarX(nx * l.f); l.naarY(ny * l.f); });
    });
    hero.addEventListener('mouseleave', function () {
      laagQuickTos.forEach(function (l) { l.naarX(0); l.naarY(0); });
    });
  }

  /* =========================================================
     2. STATEMENT — woord voor woord opgebouwd
     ========================================================= */
  gsap.utils.toArray('[data-woorden]').forEach(function (el) {
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
      { opacity: 0.1 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 35%', scrub: 0.6 }
      }
    );
  });

  /* =========================================================
     3. HOOFDSTUKKEN — stapelende kaarten + scènes
     ========================================================= */
  var hoofdstukken = gsap.utils.toArray('.dp-hoofdstuk');

  /* Vorige kaart schaalt terug en vervaagt zodra de volgende eroverheen schuift */
  mm.add('(min-width: 900px)', function () {
    hoofdstukken.forEach(function (hoofdstuk, i) {
      var volgende = hoofdstukken[i + 1];
      if (!volgende) return;
      gsap.to(hoofdstuk.querySelector('.dp-hoofdstuk__kaart'), {
        scale: 0.93,
        opacity: 0.45,
        filter: 'blur(5px)',
        ease: 'none',
        scrollTrigger: {
          trigger: volgende,
          start: 'top bottom',
          end: 'top top+=96',
          scrub: true
        }
      });
    });
  });

  /* Per hoofdstuk: scène schuift in vanuit links/rechts, zoomt langzaam,
     tekst verschijnt regel voor regel */
  hoofdstukken.forEach(function (hoofdstuk) {
    var visueel = hoofdstuk.querySelector('.dp-hoofdstuk__visueel');
    var zoom = hoofdstuk.querySelector('.dp-scene__zoom');
    var richting = visueel ? parseFloat(visueel.dataset.richting || -1) : -1;
    var tekstDelen = hoofdstuk.querySelectorAll('.dp-kicker, .dp-titel, .dp-alinea, .dp-voordelen li, .dp-cta');

    if (visueel) {
      gsap.from(visueel, {
        x: richting * 90,
        opacity: 0,
        rotation: richting * 2,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: hoofdstuk,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      });
    }
    if (zoom) {
      gsap.fromTo(zoom, { scale: 1.14 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: hoofdstuk,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8
        }
      });
    }
    if (tekstDelen.length) {
      gsap.from(tekstDelen, {
        y: 34,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: hoofdstuk,
          start: 'top 65%',
          toggleActions: 'play none none reverse'
        }
      });
    }
  });

  /* =========================================================
     4. INDEX — rijen verschijnen gestaggerd, skew op snelheid
     ========================================================= */
  var indexRijen = gsap.utils.toArray('.dp-index__rij');
  if (indexRijen.length) {
    gsap.set(indexRijen, { y: 40, opacity: 0 });
    ScrollTrigger.batch(indexRijen, {
      start: 'top 90%',
      onEnter: function (batch) {
        gsap.to(batch, {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out', overwrite: true,
          onComplete: function () { gsap.set(batch, { clearProps: 'transform' }); }
        });
      },
      onLeaveBack: function (batch) {
        gsap.to(batch, { y: 34, opacity: 0, duration: 0.4, ease: 'power2.in', overwrite: true });
      }
    });
  }
  gsap.from('.dp-index__titel', {
    y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.dp-index', start: 'top 75%', toggleActions: 'play none none reverse' }
  });

  /* Scrollsnelheid → subtiele skew op het index-raster */
  var ruweSnelheid = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) { ruweSnelheid = self.getVelocity(); }
  });
  var skewDoelen = gsap.utils.toArray('.dp-index__raster, .dp-materialen__raster, .dp-waarom__lijst')
    .map(function (el) { return gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' }); });
  var gladdeSnelheid = 0;
  gsap.ticker.add(function () {
    ruweSnelheid += (0 - ruweSnelheid) * 0.08;
    gladdeSnelheid += (ruweSnelheid - gladdeSnelheid) * 0.1;
    var doel = gsap.utils.clamp(-3, 3, gladdeSnelheid / 450);
    skewDoelen.forEach(function (naarSkew) { naarSkew(doel); });
  });

  /* =========================================================
     5. PRODUCTIEPROCES — horizontaal scrollend, gepind
     ========================================================= */
  mm.add('(min-width: 900px)', function () {
    var spoor = document.querySelector('.dp-proces__spoor');
    var proces = document.querySelector('.dp-proces');
    if (!spoor || !proces) return;

    function afstand() {
      return Math.max(0, spoor.scrollWidth - window.innerWidth + 120);
    }

    var horizontaal = gsap.to(spoor, {
      x: function () { return -afstand(); },
      ease: 'none',
      scrollTrigger: {
        trigger: proces,
        start: 'top top',
        end: function () { return '+=' + afstand(); },
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    /* Elke stap animeert zodra hij horizontaal in beeld schuift */
    gsap.utils.toArray('.dp-stap').forEach(function (stap) {
      gsap.from(stap.querySelector('.dp-stap__kaart'), {
        y: 60, opacity: 0, scale: 0.92, duration: 0.7, ease: 'power2.out',
        scrollTrigger: {
          trigger: stap,
          containerAnimation: horizontaal,
          start: 'left 82%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    /* Voortgangslijn vult mee */
    gsap.fromTo('.dp-proces__lijn-vulling', { scaleX: 0 }, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: proces,
        start: 'top top',
        end: function () { return '+=' + afstand(); },
        scrub: true
      }
    });
  });

  /* Mobiel: verticale reveals in plaats van horizontaal scrollen */
  mm.add('(max-width: 899px)', function () {
    gsap.utils.toArray('.dp-stap__kaart').forEach(function (kaart) {
      gsap.from(kaart, {
        y: 44, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: kaart, start: 'top 88%', toggleActions: 'play none none reverse' }
      });
    });
  });

  /* =========================================================
     6. MATERIALEN — 3D-tilt richting de cursor
     ========================================================= */
  var materialen = gsap.utils.toArray('.dp-mat');
  if (materialen.length) {
    gsap.set(materialen, { y: 50, opacity: 0 });
    ScrollTrigger.batch(materialen, {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.to(batch, {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out', overwrite: true,
          onComplete: function () { gsap.set(batch, { clearProps: 'transform' }); }
        });
      },
      onLeaveBack: function (batch) {
        gsap.to(batch, { y: 40, opacity: 0, duration: 0.4, ease: 'power2.in', overwrite: true });
      }
    });
  }

  if (fijnePointer) {
    materialen.forEach(function (mat) {
      var vlak = mat.querySelector('.dp-mat__vlak');
      if (!vlak) return;
      var naarRX = gsap.quickTo(vlak, 'rotationX', { duration: 0.5, ease: 'power3' });
      var naarRY = gsap.quickTo(vlak, 'rotationY', { duration: 0.5, ease: 'power3' });
      mat.addEventListener('mousemove', function (e) {
        var rect = vlak.getBoundingClientRect();
        var nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        var ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        naarRX(-ny * 9);
        naarRY(nx * 9);
        vlak.style.setProperty('--gx', ((nx + 1) * 50) + '%');
        vlak.style.setProperty('--gy', ((ny + 1) * 50) + '%');
      });
      mat.addEventListener('mouseleave', function () {
        naarRX(0);
        naarRY(0);
      });
    });
  }

  /* =========================================================
     7. WAAROM — USP's één voor één, tellers
     ========================================================= */
  gsap.from('.dp-waarom .dp-kicker, .dp-waarom .dp-titel', {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.dp-waarom', start: 'top 70%', toggleActions: 'play none none reverse' }
  });
  gsap.from('.dp-teller', {
    y: 44, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.dp-waarom__tellers', start: 'top 82%', toggleActions: 'play none none reverse' }
  });
  gsap.utils.toArray('.dp-usp').forEach(function (usp, i) {
    gsap.from(usp, {
      x: i % 2 ? 60 : -60, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: usp, start: 'top 86%', toggleActions: 'play none none reverse' }
    });
  });
  gsap.from('.dp-waarom__bestand', {
    y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.dp-waarom__bestand', start: 'top 88%', toggleActions: 'play none none reverse' }
  });

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
          onUpdate: function () { el.textContent = Math.round(teller.w) + achtervoegsel; }
        });
      }
    });
  });

  /* =========================================================
     8. FINALE — titel zoomt binnen, pers draait op de achtergrond
     ========================================================= */
  gsap.fromTo('.dp-finale__inhoud',
    { scale: 0.9, opacity: 0 },
    {
      scale: 1, opacity: 1, ease: 'power2.out',
      scrollTrigger: { trigger: '.dp-finale', start: 'top 80%', end: 'top 30%', scrub: 0.8 }
    }
  );
  gsap.to('.dp-pers__baan', {
    backgroundPositionX: '-=600px',
    ease: 'none',
    scrollTrigger: { trigger: '.dp-finale', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  /* Magnetische knoppen */
  if (fijnePointer) {
    document.querySelectorAll('.knop--hero-primair, .knop--hero-omlijnd').forEach(function (knop) {
      var naarX = gsap.quickTo(knop, 'x', { duration: 0.4, ease: 'power3' });
      var naarY = gsap.quickTo(knop, 'y', { duration: 0.4, ease: 'power3' });
      knop.addEventListener('mousemove', function (e) {
        var rect = knop.getBoundingClientRect();
        naarX((e.clientX - rect.left - rect.width / 2) * 0.18);
        naarY((e.clientY - rect.top - rect.height / 2) * 0.22);
      });
      knop.addEventListener('mouseleave', function () { naarX(0); naarY(0); });
    });
  }
})();
