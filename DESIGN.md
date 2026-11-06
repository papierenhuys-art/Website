# Design: Drukkerij Van den Herik

Het vastgelegde systeem. Elke Hallmark-run leest dit eerst en alle pagina's delen het. Wijzig het bewust; dit bestand is de regel. (Restyle van november 2026; vervangt het eerdere systeem met blauwe verlopen en gloed.)

## System
- Genre: editorial
- Shape of the first page: kept (de bestaande lay-out van alle zes pagina's bleef staan; alleen het systeem veranderde)
- Theme: brand: het huisstijlnavy, de CMYK-kleuren uit het logo, Sora en Plus Jakarta Sans
- Axes: paper/sans/cyan · posture: kept
- Idee: drukwerk op papier. Warm papier als ondergrond, effen navy inktvlakken, harde verschoven schaduwen zoals een vel op een stapel, en de snijtekens van een drukproef als enige versiering.

## Tokens
`css/tokens.css` is de bron. De rollen:
```css
:root {
  --color-paper: oklch(97.3% 0.007 89);  --color-paper-2: oklch(94.9% 0.011 90);  --color-paper-3: oklch(91.3% 0.017 88);
  --color-ink: oklch(22.5% 0.037 267);  --color-ink-2: oklch(42% 0.032 266);  --color-muted: oklch(49.2% 0.031 266);  --color-rule: oklch(86.2% 0.021 85);
  --color-accent: oklch(50.2% 0.118 241);  --color-accent-ink: oklch(98.8% 0.004 91);  --color-focus: oklch(50.2% 0.118 241);
  --color-band: oklch(31.7% 0.115 262);  --color-focus-band: oklch(78.8% 0.092 234);
  --font-display: "Sora", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;  --font-body: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 4px;  --radius-pill: 999px;  --rule-hair: 1px;  --shadow-card: 4px 4px 0 oklch(31.7% 0.115 262 / 0.1);
}
```
De spacing-, type-, easing- en duurschalen komen uit de scaffold en staan in `tokens.css`. `css/style.css` koppelt zijn Nederlandse tokennamen aan deze rollen:

| Rol | Token in style.css | Waarde |
| --- | --- | --- |
| Papier (pagina) | `--color-paper` op `body` | #f8f6f1 |
| Kaart / vel | `--wit` | #fcfbf8, nooit puur wit |
| Vlak (afwisselende sectie) | `--grijs-licht` | #f1eee6 |
| Haarlijn | `--grijs-middel` | #ddd7ca |
| Tekst | `--tekst-donker` / `--grijs-tekst` / `--tekst-zacht` | #141b2d / #454d5f / #596173 |
| Inktvlak (hero, banden, CTA) | `--blauw-donker` / `--inkt-diep` | #0d2d6b / #081d49, altijd effen |
| Actie en links | `--blauw-licht` | #006aa0, procescyaan uit het logo, verdiept tot 5,4:1 op papier |
| Logo-CMYK (alleen drukwerkdetails) | `--cmyk-cyaan` / `--cmyk-magenta` / `--cmyk-geel` | #0080c0 / #d80058 / #f8d000 |
| Duurzaamheidspagina | `--du-*` | bosgroen en salie, ook in `:root` |

## Type
- Twee families, drie gewichten: Sora 600/700 voor koppen, Plus Jakarta Sans 400/600 (700 alleen voor `strong`). Geen 500 of 800.
- Koppen in één kleur en één gewicht; een tweede regel mag, een gekleurd of verloopwoord niet.
- Labels, bijschriften en voetkoppen in de broodletter, een stap kleiner (0,875rem), in zinsnaamval, zonder letterspatiëring en zonder hoofdletters.
- Geen eyebrow boven een kop: de kop zegt het zelf. Geen gedachtestreepjes in de tekst; een komma, dubbele punt, punt of haakjes.

## Controls
- Primary: effen `--blauw-licht` met papierwitte tekst, 2px radius, 48 tot 52px hoog, `white-space: nowrap`. Hover: navy, geen beweging.
- Secondary: omlijnd, zelfde radius en hoogte. Op navy: papierwit omlijnd.
- Focus: 3px ring in `--color-focus` op papier, `--color-focus-band` op elk navy of groen vlak (lijst in style.css bij "Toegankelijke focus").

## Surfaces
- Radius: 2px voor knoppen en labels, 4px voor kaarten en vlakken, 50% alleen voor echte cirkels.
- Diepte: harde schaduwen zonder vervaging, `2px 2px 0` tot `8px 8px 0` in navy op 6 tot 22% dekking (`--schaduw-*`). Nooit een zachte gloed, nooit glas (`backdrop-filter`), nooit een verloop als achtergrond van een band.
- Hover op kaarten: één signaal, de schaduw verspringt naar `--schaduw-hover`. Niet ook nog optillen of schalen.

## Motion
- Character: calm. `transform` en `opacity` alleen, duur 120/220/420ms met `--ease-out`.
- Eén onthulling (`.reveal`), alleen verborgen als het script de klasse `js` op `<html>` heeft gezet; zonder script staat alles er direct.
- Onder `prefers-reduced-motion` eindigt alles meteen.

## Exports
`css/tokens.css` en `css/base.css` in dit project, geïmporteerd boven in `css/style.css` (direct onder de Hallmark-stempel). Tailwind-, DTCG- of shadcn-blokken worden hier op verzoek toegevoegd.
