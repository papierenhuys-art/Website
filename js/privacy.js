/* =========================================
   Privacyverklaring — inhoudsopgave volgt de leespositie (L1)
   ========================================= */
(function () {
  'use strict';

  var links = document.querySelectorAll('.pv-inhoud__lijst a');
  if (!links.length || !('IntersectionObserver' in window)) return;

  var perId = {};
  links.forEach(function (link) { perId[link.getAttribute('href').slice(1)] = link; });

  function markeer(id) {
    links.forEach(function (link) {
      var actief = link === perId[id];
      link.classList.toggle('pv-actief', actief);
      if (actief) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) markeer(entry.target.id);
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  document.querySelectorAll('.pv-blok[id]').forEach(function (blok) { observer.observe(blok); });
})();
