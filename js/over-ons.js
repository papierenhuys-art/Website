/* =========================================
   Drukkerij Van den Herik — Over ons scroll-ervaring
   GSAP + ScrollTrigger.

   - Hero met papier-parallax: lagen bewegen op eigen snelheid
   - Statement-tekst bouwt woord voor woord op (scrub)
   - Verhaal-hoofdstukken: scènes schuiven in, zoomen langzaam uit
   - Waarden-raster verschijnt gestaggerd
   - Werkwijze-tijdlijn: lijn vult mee, stappen glijden in
   - Galerij: tegels verschijnen en zoomen subtiel tijdens scrollen
   - Tellers tellen omhoog, CTA zoomt rustig binnen
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
     1. HERO — papiervellen bewegen in parallax, inhoud drijft weg
     ========================================================= */
  var hero = document.querySelector('.op-hero');

  if (hero) {
    gsap.utils.toArray('.op-hero [data-parallax]').forEach(function (laag) {
      var factor = parseFloat(laag.dataset.parallax || 0.5);
      gsap.to(laag, {
        yPercent: -34 * factor,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8
        }
      });
    });

    gsap.to('.op-hero__inhoud', {
      yPercent: -10,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom 35%',
        scrub: 0.8
      }
    });
    gsap.to('.op-hero__scrollhint', {
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: '30% top', scrub: true }
    });

    /* Muis-parallax op de papiervellen */
    if (fijnePointer) {
      var vellen = gsap.utils.toArray('.op-hero__vel').map(function (vel, i) {
        return {
          f: (i + 1) * 6,
          naarX: gsap.quickTo(vel, 'x', { duration: 0.8, ease: 'power3' }),
          naarY: gsap.quickTo(vel, 'y', { duration: 0.8, ease: 'power3' })
        };
      });
      hero.addEventListener('mousemove', function (e) {
        var rect = hero.getBoundingClientRect();
        var nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        var ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        vellen.forEach(function (v) { v.naarX(nx * v.f); v.naarY(ny * v.f); });
      });
      hero.addEventListener('mouseleave', function () {
        vellen.forEach(function (v) { v.naarX(0); v.naarY(0); });
      });
    }
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
     3. ONS VERHAAL — scènes schuiven in, zoomen langzaam,
        tekst verschijnt regel voor regel
     ========================================================= */
  gsap.utils.toArray('.op-hoofdstuk').forEach(function (hoofdstuk) {
    var visueel = hoofdstuk.querySelector('.op-hoofdstuk__visueel');
    var zoom = hoofdstuk.querySelector('.op-scene__zoom');
    var richting = visueel ? parseFloat(visueel.dataset.richting || -1) : -1;
    var tekstDelen = hoofdstuk.querySelectorAll(
      '.dp-kicker, .dp-titel, .dp-alinea, .dp-voordelen li, .op-tellers'
    );

    if (visueel) {
      gsap.from(visueel, {
        x: richting * 90,
        opacity: 0,
        rotation: richting * 1.5,
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
      gsap.fromTo(zoom, { scale: 1.12 }, {
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
     4. WAAROM — kop en kaarten verschijnen gestaggerd
     ========================================================= */
  gsap.from('.op-waarom__kop > *', {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.op-waarom', start: 'top 72%', toggleActions: 'play none none reverse' }
  });

  var waarden = gsap.utils.toArray('.op-waarde');
  if (waarden.length) {
    gsap.set(waarden, { y: 44, opacity: 0 });
    ScrollTrigger.batch(waarden, {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.to(batch, {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out', overwrite: true,
          onComplete: function () { gsap.set(batch, { clearProps: 'transform' }); }
        });
      },
      onLeaveBack: function (batch) {
        gsap.to(batch, { y: 38, opacity: 0, duration: 0.4, ease: 'power2.in', overwrite: true });
      }
    });
  }

  /* =========================================================
     5. WERKWIJZE — tijdlijn vult mee, stappen glijden in
     ========================================================= */
  gsap.from('.op-werkwijze__kop > *', {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.op-werkwijze', start: 'top 72%', toggleActions: 'play none none reverse' }
  });

  var stappen = document.querySelector('.op-stappen');
  if (stappen) {
    gsap.fromTo('.op-stappen__lijn-vulling', { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: stappen,
        start: 'top 70%',
        end: 'bottom 55%',
        scrub: 0.6
      }
    });

    gsap.utils.toArray('.op-stap').forEach(function (stap, i) {
      var kaart = stap.querySelector('.op-stap__kaart');
      var punt = stap.querySelector('.op-stap__punt');
      var vanLinks = i % 2 === 0;

      mm.add('(min-width: 900px)', function () {
        gsap.from(kaart, {
          x: vanLinks ? 70 : -70,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: stap, start: 'top 78%', toggleActions: 'play none none reverse' }
        });
      });
      mm.add('(max-width: 899px)', function () {
        gsap.from(kaart, {
          y: 44,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: stap, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
      });
      gsap.from(punt, {
        scale: 0,
        duration: 0.6,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: stap, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    });
  }

  /* =========================================================
     6. GALERIJ — tegels verschijnen, scènes zoomen subtiel mee
     ========================================================= */
  gsap.from('.op-galerij__kop > *', {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.op-galerij', start: 'top 72%', toggleActions: 'play none none reverse' }
  });

  var fotos = gsap.utils.toArray('.op-foto');
  if (fotos.length) {
    gsap.set(fotos, { y: 56, opacity: 0 });
    ScrollTrigger.batch(fotos, {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.to(batch, {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', overwrite: true,
          onComplete: function () { gsap.set(batch, { clearProps: 'transform' }); }
        });
      },
      onLeaveBack: function (batch) {
        gsap.to(batch, { y: 48, opacity: 0, duration: 0.4, ease: 'power2.in', overwrite: true });
      }
    });

    /* Langzame zoom op elke scène tijdens het scrollen */
    fotos.forEach(function (foto) {
      var scene = foto.querySelector('.op-foto__scene');
      if (!scene) return;
      gsap.fromTo(scene, { scale: 1.12 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: foto,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8
        }
      });
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
          onUpdate: function () { el.textContent = Math.round(teller.w) + achtervoegsel; }
        });
      }
    });
  });

  /* =========================================================
     8. CTA — inhoud zoomt rustig binnen, vellen in parallax
     ========================================================= */
  gsap.fromTo('.op-cta__inhoud',
    { scale: 0.92, opacity: 0 },
    {
      scale: 1, opacity: 1, ease: 'power2.out',
      scrollTrigger: { trigger: '.op-cta', start: 'top 80%', end: 'top 30%', scrub: 0.8 }
    }
  );
  gsap.utils.toArray('.op-cta__vel').forEach(function (vel, i) {
    gsap.to(vel, {
      yPercent: (i % 2 ? 18 : -22),
      rotation: (i % 2 ? -4 : 5),
      ease: 'none',
      scrollTrigger: { trigger: '.op-cta', start: 'top bottom', end: 'bottom top', scrub: true }
    });
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
