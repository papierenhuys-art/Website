# Design: Drukkerij Van den Herik

Het vastgelegde systeem. Elke Hallmark-run leest dit eerst en alle pagina's delen het. Wijzig het bewust; dit bestand is de regel. (Volledige redesign van november 2026, thema Sticker; vervangt het papier-navy-cyaan-systeem van de restyle.)

## System
- Genre: playful (het thema Sticker bepaalt het genre)
- Shape: Catalogue. Het eigen drukwerk is de inhoud: foto's van visitekaartjes, flyers, banners en etiketten als gestanste vellen.
- Theme: Sticker, kleurstelling `sheet` (deal 1/3, seed family-print-shop-dutch-c404·e6cd744c·2026-11-09·r0)
- Axes: light/display-heavy/chromatic-magenta · posture: full-palette
- Signature: elke foto en elk feit als gestanst vel, met een witte rand van 6px, een harde zwarte schaduw zonder vervaging en een kanteling van een graad of twee.

## Tokens
`css/tokens.css` is de bron; `css/base.css` bevat de Floor-basis. De rollen:
```css
:root {
  --color-paper: oklch(95.7% 0.013 82);  --color-paper-2: oklch(92.8% 0.021 79);  --color-paper-3: oklch(99.4% 0.007 89);
  --color-ink: oklch(21% 0.011 81);  --color-ink-2: oklch(30% 0.013 78);  --color-muted: oklch(50% 0.017 64);  --color-rule: oklch(89.7% 0.02 80);
  --color-white: oklch(99.5% 0.003 82);
  --color-accent: oklch(56% 0.225 2);  --color-accent-deep: oklch(49% 0.205 2);  --color-accent-2: oklch(87.6% 0.179 119);
  --color-accent-ink: oklch(99.5% 0.003 82);  --color-focus: oklch(56% 0.225 2);
  --font-display: "Bowlby One SC", "Arial Black", sans-serif;  --font-body: "Sofia Sans", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 18px;  --radius-pill: 999px;  --rule-bar: 2px;
  --shadow-card: 5px 6px 0 var(--color-ink);  --shadow-press: 1px 1px 0 var(--color-ink);
}
```
De spacing-, type-, easing- en duurschalen staan in `tokens.css`. Materiaalstalen (folie, glans, soft-touch, papiersoorten) hebben eigen tokens bovenin `css/style.css`.

## Kleur in drieën
- **Roze** is de vulling die handelt: de primaire knop, de belkaart, een cijfer dat telt. Altijd met witte tekst; bij kleine tekst `--color-accent-deep`. Nooit roze tekst op papier.
- **Limoen** is de vulling die markeert: labels, stappen-schijfjes, het slotveld.
- **Inkt** is de tekst, de menubalk, de footer en één band per pagina.
- Banden: hooguit twee per pagina (papier-2, inkt of het limoenveld als slot).

## Type
- Bowlby One SC 400 voor koppen, kaarttitels en grote cijfers; hoofdletters zitten in de letter zelf. h1 maximaal 4,5rem (Index-hero 4rem), h2 maximaal 3,25rem, in smalle kolommen 2,5rem. Lange Nederlandse woorden krijgen `&shy;` (Gelegenheids&shy;drukwerk, Kwaliteits&shy;drukwerk); "'s-Gravendeel" staat in koppen in `.heel` (geen afbreking).
- Sofia Sans 400/600/700 voor tekst, labels en knoppen; labels in zinsnaamval, 0,875rem, vet, zonder spatiëring.
- Koppen in één kleur; geen eyebrows, geen pijlen aan linkteksten, geen gedachtestreepjes.

## Oppervlakken
- `.foto` en `.vulling`: 6px witte rand, radius 22px (foto) of 18px (vlak), `--shadow-card`. Tags: 4px witte rand, pil, `3px 4px 0` schaduw.
- Kantelen tussen -2 en 2 graden, afwisselend links en rechts; tabellen, formulieren en tekst blijven recht.
- Scheidingen: een gestippelde lijn van 2px (`--rule-bar`, `--color-rule`). Geen zachte schaduw, geen verloop achter tekst, geen glas.
- Tekst staat nooit óp een foto; bijschriften staan eronder.

## Controls
- Primair: roze pil met witte ring van 5px en harde schaduw, 48px hoog. Hover: dieper roze en 2px omhoog; indrukken: op de schaduw.
- Secundair: spookpil met een inset rand van 2px in inkt; op inkt de lichte variant.
- Focus: 3px ring in roze op papier, limoen op inkt, inkt op limoen.

## Composities
- Hero per pagina: Index (/), Banner (/diensten, /privacy), Stage (/over-ons, /duurzaamheid), Counter in Banner-hoogte (/contact).
- Bouwstenen in `css/style.css`: `.catalogus`, `.rijen` met `.zij`, `.cijfers`, `.feitkaarten`, `.stappen` (genummerd via `<ol>`), `.index`, `.stalen`, `.galerij`, `.verhaal`, `.certs`, `.slot`.
- Eén kolomafstand onder de hero (`--gap-columns`, 32px). Onder 75rem vallen gesplitste blokken onder elkaar; onder 40rem alles in één kolom.

## Motion
- Character: still. Alleen hover en indrukken (2px, een graad, `--dur-micro`). Niets beweegt bij scrollen: geen onthullingen, tellers of parallax.
- De pagina's laden alleen `js/main.js` (menu, cookiemelding, voortgangsbalk) en op /privacy `js/privacy.js` (inhoudsopgave). GSAP en de oude paginascripts zijn losgekoppeld.

## Exports
`css/tokens.css` en `css/base.css`, geïmporteerd direct onder de Hallmark-stempel in `css/style.css`. Fonts via Google Fonts: Bowlby One SC en Sofia Sans 400/600/700.
