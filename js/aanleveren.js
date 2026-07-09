/* =========================================
   Drukkerij Van den Herik — Bestand aanleveren
   Drag & drop uploadomgeving op de contactpagina.

   - Slepen of klikken om meerdere bestanden toe te voegen
   - Controle op bestandstype en maximale grootte (100 MB)
   - Bestandslijst met type-badge, grootte en verwijderknop
   - Zachte fade-in van de sectie bij het scrollen
   ========================================= */
(function () {
  'use strict';

  /* ——— Fade-in bij scrollen ——— */
  var reveals = document.querySelectorAll('.ba-reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('ba-reveal--zichtbaar');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('ba-reveal--zichtbaar'); });
  }

  /* ——— Uploadomgeving ——— */
  var dropzone = document.getElementById('ba-dropzone');
  var input = document.getElementById('ba-input');
  var lijst = document.getElementById('ba-lijst');
  var melding = document.getElementById('ba-melding');
  var verzenden = document.getElementById('ba-verzenden');
  var verzendknop = document.getElementById('ba-verzendknop');
  var succes = document.getElementById('ba-succes');
  if (!dropzone || !input || !lijst) return;

  var MAX_GROOTTE = 100 * 1024 * 1024; // 100 MB
  var TOEGESTAAN = ['pdf', 'ai', 'eps', 'svg', 'indd', 'psd', 'jpg', 'jpeg', 'png', 'tif', 'tiff', 'zip'];
  var bestanden = [];

  function extensie(naam) {
    var punt = naam.lastIndexOf('.');
    return punt === -1 ? '' : naam.slice(punt + 1).toLowerCase();
  }

  function leesbareGrootte(bytes) {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1).replace('.', ',') + ' MB';
    if (bytes >= 1024) return Math.round(bytes / 1024) + ' kB';
    return bytes + ' B';
  }

  function toonMelding(tekst) {
    melding.textContent = tekst;
    melding.hidden = false;
  }

  function verbergMelding() {
    melding.hidden = true;
  }

  function werkVerzendenBij() {
    verzenden.hidden = bestanden.length === 0;
  }

  function voegBestandToe(bestand) {
    var ext = extensie(bestand.name);
    if (TOEGESTAAN.indexOf(ext) === -1) {
      return 'Het bestand "' + bestand.name + '" heeft een bestandstype dat wij niet ondersteunen.';
    }
    if (bestand.size > MAX_GROOTTE) {
      return 'Het bestand "' + bestand.name + '" is groter dan 100 MB. Neem contact met ons op voor grote bestanden.';
    }
    var bestaat = bestanden.some(function (b) {
      return b.bestand.name === bestand.name && b.bestand.size === bestand.size;
    });
    if (bestaat) return null;

    var item = document.createElement('li');
    item.className = 'ba-item';
    item.innerHTML =
      '<span class="ba-item__type"></span>' +
      '<span class="ba-item__info">' +
        '<span class="ba-item__naam"></span>' +
        '<span class="ba-item__grootte"></span>' +
      '</span>' +
      '<span class="ba-item__status" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
      '</span>' +
      '<button type="button" class="ba-item__verwijder" aria-label="Bestand verwijderen">×</button>';
    item.querySelector('.ba-item__type').textContent = ext;
    item.querySelector('.ba-item__naam').textContent = bestand.name;
    item.querySelector('.ba-item__grootte').textContent = leesbareGrootte(bestand.size) + ' — toegevoegd';

    var invoer = { bestand: bestand, element: item };
    bestanden.push(invoer);

    item.querySelector('.ba-item__verwijder').addEventListener('click', function () {
      bestanden = bestanden.filter(function (b) { return b !== invoer; });
      item.classList.add('ba-item--weg');
      item.addEventListener('animationend', function () { item.remove(); });
      werkVerzendenBij();
    });

    lijst.appendChild(item);
    return null;
  }

  function verwerkBestanden(bestandenLijst) {
    verbergMelding();
    succes.hidden = true;
    var fouten = [];
    Array.prototype.forEach.call(bestandenLijst, function (bestand) {
      var fout = voegBestandToe(bestand);
      if (fout) fouten.push(fout);
    });
    if (fouten.length) toonMelding(fouten.join(' '));
    werkVerzendenBij();
  }

  /* Klikken of toetsenbord opent bestandskiezer */
  dropzone.addEventListener('click', function () { input.click(); });
  dropzone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });
  input.addEventListener('change', function () {
    verwerkBestanden(input.files);
    input.value = '';
  });

  /* Drag & drop */
  ['dragenter', 'dragover'].forEach(function (type) {
    dropzone.addEventListener(type, function (e) {
      e.preventDefault();
      dropzone.classList.add('ba-dropzone--actief');
    });
  });
  ['dragleave', 'drop'].forEach(function (type) {
    dropzone.addEventListener(type, function (e) {
      e.preventDefault();
      dropzone.classList.remove('ba-dropzone--actief');
    });
  });
  dropzone.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files.length) {
      verwerkBestanden(e.dataTransfer.files);
    }
  });

  /* Versturen (bevestiging; koppel hier later een backend of uploaddienst aan) */
  if (verzendknop) {
    verzendknop.addEventListener('click', function () {
      verzendknop.disabled = true;
      verzendknop.textContent = 'Bezig met versturen…';
      setTimeout(function () {
        bestanden = [];
        lijst.innerHTML = '';
        verzenden.hidden = true;
        verzendknop.disabled = false;
        verzendknop.innerHTML = 'Verstuur uw bestanden <span class="knop__pijl">→</span>';
        succes.hidden = false;
        succes.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1100);
    });
  }
})();
