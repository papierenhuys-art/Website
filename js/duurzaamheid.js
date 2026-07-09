/* =========================================
   Drukkerij Van den Herik — Duurzaamheid scroll-ervaring
   GSAP + ScrollTrigger.

   - Hero met natuur-parallax: gloed, jaarringen, vellen en bladeren
     bewegen elk op eigen snelheid; bladeren zweven zacht
   - Statement bouwt woord voor woord op (scrub)
   - Intro-hoofdstuk: scène schuift in en zoomt langzaam uit
   - Cijfers tellen rustig op, bogen tekenen zichzelf
   - Certificeringen en materialen verschijnen gestaggerd
   - Proces-tijdlijn: lijn vult mee, stappen glijden in
   - CTA zoomt rustig binnen, achtergrond in parallax
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
     1. HERO — lagen in parallax, bladeren zweven, inhoud drijft weg
     ========================================================= */
  var hero = document.querySelector('.du-hero');

  if (hero) {
    gsap.utils.toArray('.du-hero [data-parallax]').forEach(function (laag) {
      var factor = parseFloat(laag.dataset.parallax || 0.5);
      gsap.to(laag, {
        yPercent: -30 * factor,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8
        }
      });
    });

    /* Zacht zweven van bladeren en vellen */
    gsap.utils.toArray('.du-hero [data-zweef]').forEach(function (el, i) {
      gsap.to(el, {
        y: '+=' + (10 + i * 4),
        rotation: '+=' + (i % 2 ? -2.5 : 2.5),
        duration: 5 + i * 1.3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    });

    /* Jaarringen tekenen zichzelf bij het laden */
    gsap.utils.toArray('.du-hero__ringen circle').forEach(function (ring, i) {
      var lengte = ring.getTotalLength();
      gsap.fromTo(ring,
        { strokeDasharray: lengte, strokeDashoffset: lengte },
        { strokeDashoffset: 0, duration: 2.4, delay: 0.4 + i * 0.25, ease: 'power2.inOut' }
      );
    });

    gsap.to('.du-hero__inhoud', {
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
    gsap.to('.du-hero__scrollhint', {
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: '30% top', scrub: true }
    });

    /* Muis-parallax op vellen en bladeren */
    if (fijnePointer) {
      var zwevers = gsap.utils.toArray('.du-hero__vel, .du-hero .du-blad').map(function (el, i) {
        return {
          f: (i + 1) * 5,
          naarX: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' })
        };
      });
      hero.addEventListener('mousemove', function (e) {
        var rect = hero.getBoundingClientRect();
        var nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        zwevers.forEach(function (z) { z.naarX(nx * z.f); });
      });
      hero.addEventListener('mouseleave', function () {
        zwevers.forEach(function (z) { z.naarX(0); });
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
     3. INTRO — scène schuift in en zoomt langzaam uit,
        tekst verschijnt regel voor regel
     ========================================================= */
  var intro = document.querySelector('.du-intro');
  if (intro) {
    gsap.from('.du-intro__visueel', {
      x: 90,
      opacity: 0,
      rotation: 1.5,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: intro, start: 'top 70%', toggleActions: 'play none none reverse' }
    });
    gsap.fromTo('.du-scene__zoom', { scale: 1.1 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: intro, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
    });
    gsap.from('.du-intro__tekst > *', {
      y: 34,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: intro, start: 'top 65%', toggleActions: 'play none none reverse' }
    });
  }

  /* =========================================================
     4. CIJFERS — tellers lopen op, bogen tekenen zichzelf
     ========================================================= */
  gsap.from('.du-cijfers__kop > *', {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.du-cijfers', start: 'top 72%', toggleActions: 'play none none reverse' }
  });

  gsap.utils.toArray('.du-cijfer').forEach(function (cijfer, i) {
    gsap.from(cijfer, {
      y: 46,
      opacity: 0,
      duration: 0.9,
      delay: i * 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.du-cijfers__raster', start: 'top 78%', toggleActions: 'play none none reverse' }
    });

    var boog = cijfer.querySelector('.du-cijfer__boog-vulling');
    if (boog) {
      gsap.to(boog, {
        strokeDashoffset: 0,
        duration: 1.8,
        delay: 0.2 + i * 0.15,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: '.du-cijfers__raster', start: 'top 78%', toggleActions: 'play none none reverse' }
      });
    }
  });

  /* Tellers — tellen rustig op (of af) zodra ze in beeld komen */
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
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: function () { el.textContent = Math.round(teller.w) + achtervoegsel; }
        });
      }
    });
  });

  /* =========================================================
     5. CERTIFICERINGEN — panelen verschijnen elegant na elkaar
     ========================================================= */
  gsap.from('.du-certs__kop > *', {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.du-certs', start: 'top 72%', toggleActions: 'play none none reverse' }
  });

  gsap.utils.toArray('.du-cert').forEach(function (cert) {
    gsap.from(cert, {
      y: 60,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: cert, start: 'top 80%', toggleActions: 'play none none reverse' }
    });
    gsap.from(cert.querySelectorAll('.du-cert__punten li'), {
      x: -18,
      opacity: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power2.out',
      scrollTrigger: { trigger: cert, start: 'top 62%', toggleActions: 'play none none reverse' }
    });
    var zegel = cert.querySelector('.du-cert__zegel');
    if (zegel) {
      gsap.from(zegel, {
        scale: 0.7,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: cert, start: 'top 74%', toggleActions: 'play none none reverse' }
      });
    }
  });

  /* =========================================================
     6. MATERIALEN — kaarten verschijnen, subtiele 3D-kanteling
     ========================================================= */
  gsap.from('.du-materialen__kop > *', {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.du-materialen', start: 'top 72%', toggleActions: 'play none none reverse' }
  });

  var materialen = gsap.utils.toArray('.du-materiaal');
  if (materialen.length) {
    gsap.set(materialen, { y: 52, opacity: 0 });
    ScrollTrigger.batch(materialen, {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.to(batch, {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', overwrite: true,
          onComplete: function () { gsap.set(batch, { clearProps: 'transform' }); }
        });
      },
      onLeaveBack: function (batch) {
        gsap.to(batch, { y: 44, opacity: 0, duration: 0.4, ease: 'power2.in', overwrite: true });
      }
    });

    /* Subtiele kanteling bij muisbeweging — het papier voelt tastbaar */
    if (fijnePointer) {
      materialen.forEach(function (kaart) {
        var naarRx = gsap.quickTo(kaart, 'rotationX', { duration: 0.6, ease: 'power3' });
        var naarRy = gsap.quickTo(kaart, 'rotationY', { duration: 0.6, ease: 'power3' });
        kaart.addEventListener('mousemove', function (e) {
          var rect = kaart.getBoundingClientRect();
          var nx = (e.clientX - rect.left) / rect.width - 0.5;
          var ny = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.set(kaart, { transformPerspective: 900 });
          naarRx(ny * -3.2);
          naarRy(nx * 3.6);
        });
        kaart.addEventListener('mouseleave', function () { naarRx(0); naarRy(0); });
      });
    }
  }

  /* =========================================================
     7. PROCES — tijdlijn vult mee, stappen glijden in
     ========================================================= */
  gsap.from('.du-proces__kop > *', {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.du-proces', start: 'top 72%', toggleActions: 'play none none reverse' }
  });

  var stappen = document.querySelector('.du-stappen');
  if (stappen) {
    gsap.fromTo('.du-stappen__lijn-vulling', { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: stappen,
        start: 'top 70%',
        end: 'bottom 55%',
        scrub: 0.6
      }
    });

    gsap.utils.toArray('.du-stap').forEach(function (stap, i) {
      var kaart = stap.querySelector('.du-stap__kaart');
      var punt = stap.querySelector('.du-stap__punt');
      var vanLinks = i % 2 === 0;

      mm.add('(min-width: 901px)', function () {
        gsap.from(kaart, {
          x: vanLinks ? 70 : -70,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: stap, start: 'top 78%', toggleActions: 'play none none reverse' }
        });
      });
      mm.add('(max-width: 900px)', function () {
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
     8. VERTROUWEN — beloftes verschijnen gestaggerd
     ========================================================= */
  gsap.from('.du-vertrouwen__kop > *', {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.du-vertrouwen', start: 'top 72%', toggleActions: 'play none none reverse' }
  });

  var beloftes = gsap.utils.toArray('.du-belofte');
  if (beloftes.length) {
    gsap.set(beloftes, { y: 44, opacity: 0 });
    ScrollTrigger.batch(beloftes, {
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
     9. CTA — inhoud zoomt rustig binnen, achtergrond in parallax
     ========================================================= */
  gsap.fromTo('.du-cta__inhoud',
    { scale: 0.94, opacity: 0 },
    {
      scale: 1, opacity: 1, ease: 'power2.out',
      scrollTrigger: { trigger: '.du-cta', start: 'top 80%', end: 'top 30%', scrub: 0.8 }
    }
  );
  gsap.utils.toArray('.du-cta__gloed, .du-cta__blad').forEach(function (el, i) {
    gsap.to(el, {
      yPercent: (i % 2 ? 16 : -20),
      rotation: (i % 2 ? -5 : 6),
      ease: 'none',
      scrollTrigger: { trigger: '.du-cta', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* Magnetische knoppen */
  if (fijnePointer) {
    document.querySelectorAll('.knop--du-primair, .knop--du-omlijnd').forEach(function (knop) {
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
