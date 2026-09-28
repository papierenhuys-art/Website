/* =========================================
   Drukkerij Van den Herik — Homepagina (GSAP + ScrollTrigger)
   Volgens DESIGN.md: 3 blikvangers + 1 slim detail, L2+.

   1. Hero: gepind; het volgende "vel papier" schuift eroverheen
      terwijl de inhoud terugwijkt en de productkaarten wegvliegen
   2. Manifest-marquee reageert op scrollsnelheid en -richting
   3. Bento-diensten: spotlight volgt de cursor (rAF-gethrottled)
   +  Kop-onthulling per regel, woord-voor-woord tekst, tellers,
      parallax, magnetische knoppen
   Alleen transform en opacity; geen filter: blur() op bewegende
   elementen. Respecteert prefers-reduced-motion en werkt zonder GSAP.
   (Scroll-voortgangsbalk en navbar-status: js/main.js)
   ========================================= */
(function () {
  'use strict';

  var beperkteBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fijnePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ——— Reveal-groepen voorbereiden ——— */
  document.querySelectorAll('.reveal-groep').forEach(function (groep) {
    Array.prototype.forEach.call(groep.children, function (kind) {
      kind.classList.add('reveal');
    });
  });

  function toonAlles() {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('reveal--zichtbaar');
    });
  }

  /* ——— Spotlight op de bento-tegels (ook zonder GSAP) ——— */
  if (fijnePointer && !beperkteBeweging) {
    document.querySelectorAll('.hp-tegel').forEach(function (tegel) {
      var wachtend = null;
      tegel.addEventListener('pointermove', function (e) {
        wachtend = e;
        if (tegel._rafId) return;
        tegel._rafId = requestAnimationFrame(function () {
          var rect = tegel.getBoundingClientRect();
          tegel.style.setProperty('--mx', (wachtend.clientX - rect.left) + 'px');
          tegel.style.setProperty('--my', (wachtend.clientY - rect.top) + 'px');
          tegel._rafId = null;
        });
      });
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
  var watermerk = hero ? hero.querySelector('.hero__watermerk') : null;
  var scrollhint = hero ? hero.querySelector('.hero__scrollhint') : null;
  var kaarten = hero ? gsap.utils.toArray(hero.querySelectorAll('.zweef-kaart')) : [];

  var mm = gsap.matchMedia();

  /* =========================================================
     1. HERO — gepind; het vel papier schuift eroverheen
     ========================================================= */
  mm.add('(min-width: 981px)', function () {
    if (!hero) return;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1
      }
    });

    if (heroInhoud) {
      tl.to(heroInhoud, { yPercent: -10, scale: 0.92, opacity: 0.15, ease: 'none' }, 0);
    }
    if (heroAchtergrond) {
      tl.to(heroAchtergrond, { scale: 1.1, ease: 'none' }, 0);
    }
    if (watermerk) {
      tl.to(watermerk, { rotation: -15, yPercent: 12, ease: 'none' }, 0);
    }
    if (scrollhint) {
      tl.to(scrollhint, { opacity: 0, duration: 0.2, ease: 'none' }, 0);
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
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: true }
    });
  });

  /* ——— Hero: muis-parallax + cursor-spotlight (alleen met fijne pointer) ——— */
  if (hero && fijnePointer) {
    var kaartQuickTos = kaarten.map(function (kaart) {
      return {
        diepte: parseFloat(kaart.dataset.diepte || 0.5),
        naarX: gsap.quickTo(kaart, 'x', { duration: 0.7, ease: 'power3' }),
        naarY: gsap.quickTo(kaart, 'y', { duration: 0.7, ease: 'power3' })
      };
    });
    var heroEvent = null;
    var heroRaf = null;

    hero.addEventListener('pointermove', function (e) {
      heroEvent = e;
      if (heroRaf) return;
      heroRaf = requestAnimationFrame(function () {
        var rect = hero.getBoundingClientRect();
        var fx = (heroEvent.clientX - rect.left) / rect.width;
        var fy = (heroEvent.clientY - rect.top) / rect.height;
        kaartQuickTos.forEach(function (k) {
          k.naarX((fx - 0.5) * 52 * k.diepte);
          k.naarY((fy - 0.5) * 40 * k.diepte);
        });
        hero.style.setProperty('--mx', (fx * 100) + '%');
        hero.style.setProperty('--my', (fy * 100) + '%');
        hero.classList.add('spot-actief');
        heroRaf = null;
      });
    });

    hero.addEventListener('pointerleave', function () {
      kaartQuickTos.forEach(function (k) { k.naarX(0); k.naarY(0); });
      hero.classList.remove('spot-actief');
    });
  }

  /* =========================================================
     2. MANIFEST — draait mee met scrollrichting en -snelheid
     ========================================================= */
  var ruweSnelheid = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: function (self) { ruweSnelheid = self.getVelocity(); }
  });

  var manifestBaan = document.querySelector('.hp-manifest__baan');
  if (manifestBaan) {
    var manifestTween = gsap.to(manifestBaan, { xPercent: -50, duration: 46, ease: 'none', repeat: -1 });
    var gladdeSnelheid = 0;
    var tempo = 1;
    gsap.ticker.add(function () {
      ruweSnelheid += (0 - ruweSnelheid) * 0.08;
      gladdeSnelheid += (ruweSnelheid - gladdeSnelheid) * 0.1;
      var doel = gsap.utils.clamp(-4, 5, 1 + gladdeSnelheid / 700);
      tempo += (doel - tempo) * 0.08;
      manifestTween.timeScale(tempo);
    });
    /* Het manifest schuift bij binnenkomst iets op, voor extra diepte */
    gsap.fromTo('.hp-manifest', { x: 80 }, {
      x: -80,
      ease: 'none',
      scrollTrigger: { trigger: '.hp-vel', start: 'top bottom', end: 'bottom top', scrub: 0.8 }
    });
  }

  gsap.from('.hp-belofte', {
    y: 26, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: '.hp-beloften', start: 'top 92%', toggleActions: 'play none none reverse' }
  });

  /* =========================================================
     3. KOPPEN — regel voor regel omhoog uit een masker
     ========================================================= */
  gsap.utils.toArray('.kop-onthul').forEach(function (kop) {
    gsap.from(kop.querySelectorAll('.kop-regel > span'), {
      yPercent: 110,
      duration: 0.95,
      stagger: 0.09,
      ease: 'power3.out',
      scrollTrigger: { trigger: kop, start: 'top 86%', toggleActions: 'play none none reverse' }
    });
  });

  /* =========================================================
     4. REVEALS — elegant in beeld, en weer weg bij terugscrollen
     ========================================================= */
  var woordElementen = gsap.utils.toArray('[data-woorden]');
  var onthullers = gsap.utils.toArray('.reveal').filter(function (el) {
    return woordElementen.indexOf(el) === -1;
  });

  /* CSS-transities staan uit zolang GSAP animeert, zodat ze niet botsen */
  gsap.set(onthullers, { y: 44, opacity: 0, transition: 'none' });

  ScrollTrigger.batch(onthullers, {
    start: 'top 90%',
    onEnter: function (batch) {
      gsap.set(batch, { transition: 'none' });
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.09,
        overwrite: true,
        onComplete: function () {
          /* transform vrijgeven zodat CSS-hovereffecten weer werken */
          gsap.set(batch, { clearProps: 'transform,transition' });
        }
      });
    },
    onLeaveBack: function (batch) {
      gsap.set(batch, { transition: 'none' });
      gsap.to(batch, { y: 36, opacity: 0, duration: 0.45, ease: 'power2.in', overwrite: true });
    }
  });

  /* =========================================================
     5. TEKST — woord voor woord opgebouwd, gekoppeld aan scroll
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
      { opacity: 0.14 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 86%', end: 'top 45%', scrub: 0.6 }
      }
    );
  });

  /* =========================================================
     6. PARALLAX — beeld en cijfers bewegen op eigen tempo
     ========================================================= */
  gsap.utils.toArray('.hp-tegel__beeld .dp-scene__zoom').forEach(function (zoom) {
    gsap.fromTo(zoom, { yPercent: 6 }, {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: { trigger: zoom.closest('.hp-tegel'), start: 'top bottom', end: 'bottom top', scrub: 0.8 }
    });
  });

  mm.add('(min-width: 981px)', function () {
    var feiten = document.querySelector('.hp-feiten');
    if (feiten) {
      gsap.fromTo(feiten, { y: 60 }, {
        y: -40,
        ease: 'none',
        scrollTrigger: { trigger: '.hp-over-sectie', start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      });
    }
  });

  gsap.utils.toArray('.hp-cta__pasmerk').forEach(function (merk, i) {
    gsap.to(merk, {
      yPercent: i ? -30 : 30,
      rotation: i ? -25 : 25,
      ease: 'none',
      scrollTrigger: { trigger: '.hp-cta', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* CTA: titel en knoppen zoomen rustig binnen */
  gsap.fromTo('.hp-cta__inhoud',
    { scale: 0.93, opacity: 0 },
    {
      scale: 1, opacity: 1, ease: 'power2.out',
      scrollTrigger: { trigger: '.hp-cta', start: 'top 82%', end: 'top 35%', scrub: 0.8 }
    }
  );

  /* Footer schuift elegant omhoog in beeld */
  var footerInhoud = document.querySelector('.footer .container');
  if (footerInhoud) {
    gsap.from(footerInhoud, {
      y: 48,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.footer', start: 'top 92%', toggleActions: 'play none none reverse' }
    });
  }

  /* =========================================================
     7. TELLERS — tellen omhoog zodra ze in beeld komen
     ========================================================= */
  gsap.utils.toArray('[data-teller]').forEach(function (el) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
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
     8. MICRO-INTERACTIES — magnetische knoppen op donkere vlakken
     ========================================================= */
  if (fijnePointer) {
    document.querySelectorAll('.knop--hero-primair, .knop--hero-omlijnd').forEach(function (knop) {
      var naarX = gsap.quickTo(knop, 'x', { duration: 0.4, ease: 'power3' });
      var naarY = gsap.quickTo(knop, 'y', { duration: 0.4, ease: 'power3' });
      knop.addEventListener('pointermove', function (e) {
        var rect = knop.getBoundingClientRect();
        naarX((e.clientX - rect.left - rect.width / 2) * 0.18);
        naarY((e.clientY - rect.top - rect.height / 2) * 0.22);
      });
      knop.addEventListener('pointerleave', function () {
        naarX(0);
        naarY(0);
      });
    });
  }
})();
