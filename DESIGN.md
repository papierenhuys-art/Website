# DESIGN.md — Drukkerij Van den Herik

> Vakmanschap sinds 1961, gedrukt op de achtergrond van een moderne website: rustig, betrouwbaar en met oog voor elk detail — zoals goed drukwerk zelf.

Dit document is de bron van waarheid voor de vormgeving van de website. Nieuwe secties en pagina's worden hier eerst aan getoetst. Alle kleuren, lettertypes, schaduwen en animaties in `css/style.css` verwijzen naar de tokens hieronder.

---

## 1. Visual Theme & Atmosphere

**Style**: Warm Professional, met donkere "Dark Editorial"-accenten in hero's en afsluitende CTA's
**Keywords**: vakmanschap, vertrouwen, rust, precisie, papier & inkt, familiebedrijf, modern
**Tone**: professioneel, persoonlijk, zelfverzekerd — NOT schreeuwerig, speels, technisch of goedkoop
**Feel**: als een dik, mat visitekaartje met een subtiele foliedruk — je voelt de kwaliteit voordat je het leest.

**Beeldtaal**: drukwerk als motief — papiervellen, CMYK-inktlagen, snijtekens, pasmerken, drukrollen. Illustraties worden met CSS opgebouwd; echte foto's van het eigen pand, de machines en het team hebben altijd voorrang zodra ze beschikbaar zijn. Geen stockfoto's die zich voordoen als het eigen bedrijf.

**Interaction Tier**:
| Paginatype | Tier | Toelichting |
|---|---|---|
| Homepagina | **L2+** | scroll-reveals, parallax, velocity-marquee, gepinde hero-overgang, spotlight-kaarten |
| Diensten / Over ons / Duurzaamheid | **L2+** | storytelling met ScrollTrigger (max. 2 pins per pagina) |
| Contact / Privacy | **L1** | rustige fade-in en zachte hovers — hier staat taakgerichtheid voorop |

**Dependencies**: GSAP 3.12.5 + ScrollTrigger (cdnjs) op L2-pagina's; L1-pagina's draaien op CSS + IntersectionObserver. Geen Lenis, geen WebGL.

---

## 2. Color Palette & Roles

```css
:root {
  /* ——— Inkt: het merkblauw, van nacht tot glans ——— */
  --inkt-nacht:   #060f2b;   /* diepste achtergrond (CTA, finale) */
  --inkt-diep:    #081d49;   /* hero-gradients, donkere secties */
  --blauw-donker: #0d2d6b;   /* merkkleur: navigatie, koppen, primaire vlakken */
  --inkt-marine:  #123a80;   /* gradient-eindpunt donkere secties */
  --blauw-middel: #1a4da0;   /* secundair vlak, gradients */
  --blauw-licht:  #2d6fd4;   /* ACCENT: CTA's, links, actieve staten */
  --blauw-accent: #4a90d9;   /* hover-accent, iconen op donker */
  --blauw-glans:  #7ab0ff;   /* lichtaccent op donker (gradienttekst, lijnen) */
  --blauw-mist:   #bcd8ff;   /* zachte glans */
  --blauw-ijs:    #dbe6f6;   /* lichte illustratievlakken */
  --blauw-wolk:   #e8f0fc;   /* lichtste blauwtint */

  /* ——— Papier: achtergronden en vlakken ——— */
  --wit:          #ffffff;   /* pagina-achtergrond, kaarten */
  --grijs-licht:  #f4f7fc;   /* alternerende secties, panelen */
  --papier-diep:  #e9eff9;   /* verdiepte vlakken, gradient-eindpunt */
  --grijs-middel: #e0e8f5;   /* standaardranden, scheidingslijnen */

  /* ——— Tekst ——— */
  --tekst-donker: #1a202c;   /* hoofdtekst */
  --grijs-tekst:  #4a5568;   /* lopende tekst, beschrijvingen */
  --tekst-zacht:  #61728f;   /* labels, hulptekst, placeholders */

  /* ——— Signaal ——— */
  --succes:       #059669;   --succes-diep: #065f46;   --succes-zacht: #ecfdf5;
  --waarschuwing: #92600a;   --waarschuwing-zacht: #fef3e2;
  --fout:         #c53030;   --fout-zacht: #fde8e8;

  /* ——— Groen: duurzaamheid (homepagina-teaser, groene accenten) ——— */
  --groen-diep:   #1a4a2e;
  --groen:        #2a7a46;
  --groen-helder: #3a9b5c;

  /* ——— Drukwerk-illustratie (alleen in scènes, nooit in UI) ——— */
  --cmyk-cyaan:   #00b7e8;   --cmyk-magenta: #e6007e;   --cmyk-geel: #ffd500;
  --folie-goud:   #b8860b;   --folie-licht:  #f6d878;   --folie-donker: #8a6d1f;
  --kraft:        #e6dccd;   --kraft-diep:   #dfd3c0;   --roos: #d4708a;

  /* ——— RGB-hulpwaarden voor rgba() ——— */
  --inkt-rgb:        6, 15, 43;
  --blauw-donker-rgb: 13, 45, 107;
  --blauw-licht-rgb: 45, 111, 212;
  --blauw-glans-rgb: 122, 176, 255;
  --wit-rgb:         255, 255, 255;
  --groen-rgb:       58, 155, 92;
}
```

**Color Rules:**
- Alle kleuren in CSS en JavaScript lopen via deze variabelen — **nul losse hex-waarden** buiten de tokenblokken (`:root` en het `.pagina-duurzaamheid`-palet).
- `--blauw-licht` is het enige accent voor interactie (knoppen, links, focus). Per sectie maximaal één accentkleur.
- Donkere vlakken gebruiken de inkt-schaal (`--inkt-nacht` → `--blauw-middel`); lichte vlakken wit en `--grijs-licht`. Nooit puur zwart (`#000`) als vlak.
- Transparantie altijd via de RGB-hulpwaarden: `rgba(var(--wit-rgb), 0.7)`.
- Groen is gereserveerd voor duurzaamheid; CMYK-, folie- en kraftkleuren alleen in illustraties.
- Contrast lopende tekst ≥ 4.5:1 (WCAG AA); `--tekst-zacht` alleen voor tekst ≥ 13px die niet essentieel is.

---

## 3. Typography Rules

**Font Stack:**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');

:root {
  --font-display: 'Sora', 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
  --font-tekst:   'Plus Jakarta Sans', 'Segoe UI', system-ui, -apple-system, sans-serif;
}
```
In de HTML via één `<link>` met `preconnect` naar `fonts.googleapis.com` en `fonts.gstatic.com`.

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Hero H1 | Sora | `clamp(2.4rem, 5.6vw, 4.35rem)` (≥ 60px desktop) | 800 | 1.05 | -0.025em |
| Section H2 | Sora | `clamp(1.9rem, 3.6vw, 2.9rem)` | 800 | 1.12 | -0.02em |
| H3 | Sora | 1.02–1.2rem | 700 | 1.35 | -0.01em |
| Statement | Sora | `clamp(1.4rem, 2.9vw, 2.15rem)` | 700 | 1.4 | -0.01em |
| Body | Plus Jakarta Sans | 1rem (16px) | 400 | 1.7–1.8 | — |
| Body klein | Plus Jakarta Sans | 0.88–0.95rem | 400–500 | 1.65–1.75 | — |
| Kicker / Label | Plus Jakarta Sans | 0.78rem | 700 | 1.4 | 0.18em, HOOFDLETTERS |
| Cijfers (tellers) | Sora | `clamp(2.1rem, 4.5vw, 3.4rem)` | 800 | 1 | -0.02em, `tabular-nums` |

**Typography Rules:**
- Koppen altijd Sora ≥ 700; lopende tekst altijd Plus Jakarta Sans.
- Maximaal ~65 tekens per regel voor lopende tekst (`max-width: 480–560px`).
- Kopregels bewust afbreken met `<br />` op desktop; nooit weeskinderen van één woord in hero's.
- **NEVER use**: Arial/Helvetica als bewuste keuze, Comic Sans, serif-display-fonts, meer dan twee families, font-weights < 400.

**Text Decoration** (volgens `text-decoration-rules.md`):
- Hero H1 op donker vlak: tweede regel met een subtiele gradient (`--blauw-glans` → wit). *Bewuste afwijking* van de Warm Professional-regel: de hero's zijn Dark Editorial-vlakken, en het accent markeert de kernbelofte. Geen text-shadow erbij.
- Section H2 op licht vlak: geen gradient, geen schaduw.
- Kicker: kleur + letterafstand, geen onderstreping.
- Lopende tekst: nooit decoratie.

---

## 4. Component Stylings

### Buttons
```css
.knop {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  min-height: 48px; padding: 14px 32px;
  border-radius: var(--radius-knop); border: 2px solid transparent;
  font-family: var(--font-tekst); font-weight: 600; font-size: 1rem;
  cursor: pointer;
  transition: background var(--duur-snel) var(--ease-zacht), color var(--duur-snel) var(--ease-zacht),
              border-color var(--duur-snel) var(--ease-zacht), box-shadow var(--duur) var(--ease-zacht),
              transform var(--duur-snel) var(--ease-uit);
}
/* Primair (licht vlak) */
.knop--primair            { background: var(--blauw-licht); color: var(--wit); }
.knop--primair:hover      { background: var(--blauw-donker); color: var(--wit); box-shadow: var(--schaduw-hover); transform: translateY(-2px); }
.knop--primair:active     { transform: translateY(0); box-shadow: var(--schaduw-zacht); }
.knop:focus-visible       { outline: 3px solid var(--focus-ring); outline-offset: 3px; }
.knop:disabled,
.knop[aria-disabled="true"] { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

/* Hero-primair (donker vlak): wit met glanssweep + magnetisch (JS) */
.knop--hero-primair        { background: var(--wit); color: var(--blauw-donker); font-weight: 700; border-radius: 12px; box-shadow: 0 12px 34px rgba(var(--inkt-rgb), 0.4); }
.knop--hero-primair:hover  { box-shadow: 0 18px 44px rgba(var(--inkt-rgb), 0.55); }
.knop--hero-primair:active { box-shadow: 0 8px 20px rgba(var(--inkt-rgb), 0.4); }

/* Omlijnd (donker vlak) */
.knop--hero-omlijnd        { color: var(--wit); border: 1.5px solid rgba(var(--wit-rgb), 0.35); background: rgba(var(--wit-rgb), 0.02); border-radius: 12px; }
.knop--hero-omlijnd:hover  { background: rgba(var(--wit-rgb), 0.1); border-color: rgba(var(--wit-rgb), 0.7); }
.knop--hero-omlijnd:active { background: rgba(var(--wit-rgb), 0.16); }
```

### Cards
```css
.kaart {
  background: var(--wit); border: 1px solid var(--grijs-middel); border-radius: var(--radius-kaart);
  padding: 32px 28px; box-shadow: var(--schaduw-vlak);
  transition: transform var(--duur) var(--ease-uit), box-shadow var(--duur) var(--ease-zacht), border-color var(--duur) var(--ease-zacht);
}
.kaart:hover           { transform: translateY(-6px); box-shadow: var(--schaduw-hover); border-color: rgba(var(--blauw-licht-rgb), 0.35); }
.kaart:focus-within    { border-color: var(--blauw-licht); }
.kaart:active          { transform: translateY(-2px); }

/* Spotlight-kaart (homepagina-bento): licht volgt de cursor via --mx/--my */
.hp-tegel::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(var(--blauw-licht-rgb), 0.12), transparent 60%);
  opacity: 0; transition: opacity var(--duur) var(--ease-zacht);
}
.hp-tegel:hover::before, .hp-tegel:focus-visible::before { opacity: 1; }
```

### Navigation
```css
.navbar               { position: sticky; top: 0; z-index: 100; background: var(--blauw-donker); transition: background var(--duur) var(--ease-zacht), box-shadow var(--duur) var(--ease-zacht); }
.navbar--gescrold     { background: rgba(var(--blauw-donker-rgb), 0.9); backdrop-filter: blur(14px) saturate(150%); box-shadow: 0 8px 28px rgba(var(--inkt-rgb), 0.45); }
.navbar__menu a       { color: rgba(var(--wit-rgb), 0.85); padding: 8px 16px; border-radius: var(--radius); }
.navbar__menu a:hover,
.navbar__menu a.actief { background: rgba(var(--wit-rgb), 0.12); color: var(--wit); }
.navbar__menu a:focus-visible { outline: 3px solid var(--focus-ring-licht); outline-offset: 2px; }
```
Scroll-voortgangsbalk (3px, `--blauw-accent` → `--blauw-glans`) bovenaan elke pagina.

### Links
```css
a              { color: var(--blauw-licht); text-decoration: none; transition: color var(--duur-snel) var(--ease-zacht); }
a:hover        { color: var(--blauw-donker); }
a:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 3px; border-radius: 4px; }
.tekst-link    { background: linear-gradient(currentColor, currentColor) 0 100% / 0 1.5px no-repeat; transition: background-size var(--duur) var(--ease-uit); }
.tekst-link:hover { background-size: 100% 1.5px; }
```

### Tags / Badges
```css
.dp-kicker        { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--blauw-licht); }
.dp-kicker--licht { color: rgba(var(--wit-rgb), 0.65); }
.hero__badge      { display: inline-flex; gap: 10px; padding: 6px 16px; border-radius: 999px; background: rgba(var(--wit-rgb), 0.08); border: 1px solid rgba(var(--wit-rgb), 0.18); }
```

### Formuliervelden
```css
.formulier-groep input, .formulier-groep textarea {
  width: 100%; min-height: 48px; padding: 12px 16px; border: 2px solid var(--grijs-middel);
  border-radius: var(--radius); background: var(--wit); color: var(--tekst-donker); font: inherit;
}
.formulier-groep input:hover         { border-color: var(--blauw-ijs); }
.formulier-groep input:focus         { border-color: var(--blauw-licht); box-shadow: 0 0 0 3px rgba(var(--blauw-licht-rgb), 0.15); outline: none; }
.formulier-groep input[aria-invalid="true"] { border-color: var(--fout); }
.formulier-groep input:disabled      { background: var(--grijs-licht); color: var(--tekst-zacht); cursor: not-allowed; }
```

---

## 5. Layout Principles

**Container:**
- Max width: `1140px` (`.container`), padding `0 24px`
- Brede kaart-secties (diensten-hoofdstukken): `1180px`
- Tekstrijk (privacy, artikelen): `760px` leeskolom

**Spacing Scale** (8-punts ritme):
- Sectie-padding: `clamp(72px, 9vw, 118px)` verticaal; mobiel ≥ 56px
- Kop → inhoud: 48–56px
- Component-gap: 20–28px (kaarten), 14px (actielijsten)
- Kaart-padding: 28–36px desktop, 24px mobiel

**Grid:**
```css
.raster-2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(40px, 6vw, 72px); align-items: center; }
.raster-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
/* Bento (homepagina): ongelijke tegels */
.hp-bento { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: minmax(210px, auto); gap: 20px; }
.hp-tegel--groot { grid-column: span 2; grid-row: span 2; }
.hp-tegel--breed { grid-column: span 2; }
```
Gridkolommen altijd `minmax(0, 1fr)` zodat lange woorden nooit horizontale overflow geven.

---

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | geen schaduw, 1px `--grijs-middel` rand | lijsten, FAQ, secties op `--grijs-licht` |
| Vlak | `--schaduw-vlak: 0 2px 14px rgba(var(--blauw-donker-rgb), 0.05)` | kaarten in rust |
| Zacht | `--schaduw: 0 4px 20px rgba(var(--blauw-donker-rgb), 0.12)` | panelen, formulieren |
| Hover | `--schaduw-hover: 0 18px 40px rgba(var(--blauw-donker-rgb), 0.14)` | kaarten/knoppen bij hover |
| Zwevend | `--schaduw-zwevend: 0 24px 60px rgba(var(--blauw-donker-rgb), 0.18)` | illustratiescènes, hoofdstukkaarten |
| Diep | `0 18px 40px rgba(var(--inkt-rgb), 0.35)` | glazen kaarten op donkere hero's |

**Radius**: `--radius: 8px` (velden), `--radius-knop: 12px`, `--radius-kaart: 20px`, `--radius-scene: 24px`.
Glas (backdrop-filter) alleen op kleine vlakken en maximaal `blur(14px)`.

---

## 7. Animation & Interaction

**Motion Philosophy**: zoals een vel papier dat de pers verlaat — vloeiend, precies, nooit haastig. Alleen `transform` en `opacity`; animaties verfijnen, ze domineren niet.
**Tier**: L2+ (homepagina, diensten, over ons, duurzaamheid) / L1 (contact, privacy)

### Dependencies
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

### Tokens
```css
:root {
  --ease-uit:   cubic-bezier(0.16, 1, 0.3, 1);   /* reveals, kaarten */
  --ease-zacht: cubic-bezier(0.22, 1, 0.36, 1);  /* hovers */
  --duur-snel:  0.25s;
  --duur:       0.35s;
  --duur-traag: 0.75s;
}
```

### Base Setup
```js
gsap.registerPlugin(ScrollTrigger);
document.body.classList.add('gsap-actief');
if (matchMedia('(prefers-reduced-motion: reduce)').matches) { /* alles direct tonen, return */ }
ScrollTrigger.config({ ignoreMobileResize: true });
```
Scroll-voortgangsbalk en navbar-scrollstaat staan centraal in `js/main.js` (rAF-gethrottled) en werken op elke pagina — ook zonder GSAP.

### Entrance Animation
```css
@keyframes hero-onthul { to { transform: translateY(0); } }            /* H1 per regel, mask reveal */
@keyframes hero-fade   { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
.hero__regel { display: block; overflow: hidden; }
.hero__regel > span { display: inline-block; transform: translateY(115%); animation: hero-onthul 0.9s var(--ease-uit) forwards; }
```

### Scroll Behavior
```js
/* Reveal: fadeInUp met stagger, omkeerbaar */
ScrollTrigger.batch('.reveal', {
  start: 'top 88%',
  onEnter: b => gsap.to(b, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.09 }),
  onLeaveBack: b => gsap.to(b, { y: 36, opacity: 0, duration: 0.45 })
});
/* Section H2: regel voor regel omhoog uit een masker (ScrollFloat-achtig) */
gsap.from(kop.querySelectorAll('.kop-regel > span'), { yPercent: 110, duration: 0.9, stagger: 0.08, ease: 'power3.out',
  scrollTrigger: { trigger: kop, start: 'top 85%', toggleActions: 'play none none reverse' } });
/* Body: woord-voor-woord opbouw, gekoppeld aan scroll (ScrollReveal) */
/* Parallax: achtergrondlagen met yPercent + scrub; max 2 pins per pagina */
```

### Hover & Focus States
```css
:where(a, button, [role="button"], input, textarea, select, summary):focus-visible {
  outline: 3px solid var(--focus-ring); outline-offset: 3px;
}
.op-donker :where(a, button):focus-visible { outline-color: var(--focus-ring-licht); }
```
Elk interactief element heeft een hover- én een zichtbare focus-staat. Kaarten: lift −6px + schaduw; iconen kleuren mee; pijlen schuiven 4–5px.

### Special Effects (homepagina — 3 blikvangers + 1 slim detail)
1. **Hero**: titel-maskreveal, zwevende productkaarten met muis-parallax, cursor-spotlight, aurora-gloed en korrel.
2. **Eerste scroll**: het volgende "vel papier" schuift over de gepinde hero heen, met een groot manifest dat meebeweegt op de scrollsnelheid.
3. **Diensten**: bento-raster met ongelijke tegels en een spotlight die de cursor volgt (rAF-gethrottled).
4. **Slim detail**: bij hover verschijnen **snijtekens** rond de diensttegels, net als op een drukproef. Wie het ziet, glimlacht.

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
  .reveal, .hero__regel > span, .kop-regel > span { opacity: 1 !important; transform: none !important; }
}
```
In JavaScript: bij `prefers-reduced-motion` worden géén ScrollTriggers aangemaakt en is alle inhoud direct zichtbaar.

---

## 8. Do's and Don'ts

### Do
- ✅ Kleuren, fonts, radii, schaduwen en easing uitsluitend via tokens.
- ✅ Elke sectie: kicker → Sora-kop → korte alinea → inhoud. Herkenbaar ritme op elke pagina.
- ✅ Drukwerkmotieven (papier, inkt, snijtekens, CMYK) als rode draad in illustraties.
- ✅ Veel witruimte; één boodschap per sectie.
- ✅ Iconen als inline SVG-lijniconen (stroke 1.5–1.6, `currentColor`).
- ✅ Tellers en cijfers in `tabular-nums` zodat ze niet verspringen.
- ✅ Elke animatie heeft een `prefers-reduced-motion`-pad en een werkende weergave zonder GSAP.
- ✅ Echte foto's van pand, machines en team zodra beschikbaar — bij voorkeur `loading="lazy"` en met `width`/`height`.

### Don't
- ❌ Losse hex-kleuren in componenten of JavaScript.
- ❌ Emoji als iconen.
- ❌ `filter: blur()` op bewegende of geanimeerde elementen — gebruik opacity + scale.
- ❌ `backdrop-filter` boven `blur(14px)` of over grote scrollende vlakken.
- ❌ Meer dan 2 ScrollTrigger-pins per pagina; geen scroll-jacking (Lenis) of WebGL.
- ❌ Stockfoto's die suggereren dat het ons pand, onze machines of ons team is.
- ❌ Gelijkvormige kaartenrasters op de homepagina als blikvanger — gebruik de bento.
- ❌ Inline `style="..."` in HTML (uitzondering: dynamische waarden via JS).
- ❌ Aanraakdoelen kleiner dan 44×44px op mobiel.
- ❌ Knallende kleuren, neon, glitch- of typewriter-effecten — dat past niet bij een familiebedrijf van 60+ jaar.
- ❌ Scroll-skew of schuddende elementen op inhoud die gelezen moet worden.

---

## 9. Responsive Behavior

**Breakpoints:**
| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | > 980px | volledige hero met zwevende kaarten, gepinde overgangen, 4-koloms bento |
| Tablet | 681–980px | geen pins; bento 2 kolommen; zwevende kaarten verborgen |
| Mobile | ≤ 680px | hamburger-menu; 1 kolom; knoppen 100% breed; kaart-padding 24px |

**Touch Targets:** minimaal 44×44px (menu-items, hamburger, footerlinks, knoppen).
**Collapsing Strategy:** rasters vallen terug naar 2 → 1 kolom; tekst-beeld-hoofdstukken stapelen met beeld bovenaan; horizontale processen worden verticale tijdlijnen; hover-onthullingen zijn op touch standaard zichtbaar.

```css
@media (max-width: 980px) {
  .hp-bento { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hp-tegel--groot { grid-row: span 1; }
}
@media (max-width: 680px) {
  .hamburger { display: flex; width: 44px; height: 44px; }
  .navbar__menu a { padding: 12px 16px; width: 100%; }
  .footer__links a { display: inline-flex; align-items: center; min-height: 44px; }
  .hp-bento { grid-template-columns: 1fr; }
  .hp-tegel--groot, .hp-tegel--breed { grid-column: auto; }
}
```
