# Mood Tracker

A mood-and-day tracker you run in a browser and install to your home screen like a native app.
Everything is stored on your device — no account, no server, no analytics.

Built as a faithful reimplementation of a mood-diary app from a screen recording and screenshots:
the calendar of mood faces, the entry editor with emotions and activities, the ~400-icon picker,
the monthly and annual statistics, the filter sheet, and an archive.

## Install it

Open the site, then:

- **iPhone / iPad** — Safari → Share → *Add to Home Screen*. It launches full-screen with its own icon.
- **Android** — Chrome → menu → *Install app*.
- **Desktop** — Chrome/Edge → the install icon in the address bar.

It works offline after the first load: the shell and every icon are pre-cached.

## Run it locally

No build step, no dependencies. Any static server works:

```sh
python3 -m http.server 8777     # then open http://localhost:8777
```

## Deploy it

`.github/workflows/pages.yml` publishes the repo root to GitHub Pages on every push to `main`.
Enable it once under **Settings → Pages → Source: GitHub Actions**; the URL appears in the
workflow summary. Any other static host (Netlify, Cloudflare Pages, Vercel) works too — upload
the repository as-is.

## What's in it

| Screen | What it does |
| --- | --- |
| Calendar | Month grid of mood faces; tap a day to see it, tap again to edit. Selected day is pilled in green. |
| Entry card | Mood, favourite star, photos, emotions + activities as chips, note, weather and sleep. |
| Editor | Five-mood selector, 20 labelled emotions, activity icons from the picker, photos, note, weather, sleep. |
| Icon picker | ~400 icons across eight categories — People, Nature, Food & Drink, Travel & Places, Activities, Objects, Health & Home, Exercise (plus stars and digits). |
| Stats | *Monthly*: Mood Flow line chart and Mood Bar, with a faded sample and a prompt when a month is empty. *Annual*: a year of months as mood dots. |
| Archive | Every entry, searchable by note or emotion, with the "When did I record…" filter sheet (moods, emotions, period) and favourites. |
| Profile | Averages and streak, theme, week start, automatic weather, backup / restore / erase. |

Icons are **grey when unselected and full colour when selected**, everywhere they appear.

## Your data

- Entries and photos live in IndexedDB on the device that wrote them. Nothing is uploaded.
- **Back up to a file** writes a JSON file containing every entry and photo (photos as data URIs).
  **Restore from a file** reads it back. Do this now and then: iOS can evict web-app storage if the
  app goes unused for weeks, and deleting the home-screen icon can take the data with it.
- Weather is the one network call: when you log an entry, the app asks for your location and fetches
  the current conditions from [Open-Meteo](https://open-meteo.com) (no key, no account). Decline the
  location prompt, or turn it off in Profile, and weather becomes a manual choice. Sleep is always manual —
  browsers cannot read Apple Health.

Photos are downscaled to 1280px and re-encoded as JPEG before being stored, to keep the quota in check.

## Layout

```
index.html              markup shell
app.css                 all styling; design tokens at the top
manifest.webmanifest    PWA manifest
sw.js                   offline cache (bump CACHE after changing app files)
js/
  app.js                state, routing, calendar screen, global events
  editor.js             entry editor + icon picker + weather lookup
  stats.js              monthly charts and the annual grid
  archive.js            archive list, search, filter sheet
  profile.js            profile and settings
  icons.js              icon catalogue, emotions, weather list
  moods.js              the five mood faces and the mascot, as inline SVG
  db.js                 IndexedDB wrapper, JSON export/import
  ui.js                 DOM helpers, line icons, sheets, toasts
assets/icons/           icon SVGs (+ index.json, the precache list)
assets/img/             app icons
```

Deep links: `#2026-04-01` opens that day, `#log` opens today's editor — handy as a home-screen shortcut.

## Colours

Sampled from the source screenshots, not guessed:

| | |
| --- | --- |
| Moods | `#E6D688` `#B3CE85` `#69A16B` `#3C6A48` `#626B67` |
| Accent | `#619E62` |
| Background / card | `#EFEFEA` / `#FFFFFF` |
| Chip mint / chip off | `#EBEFE3` / `#ECECEC` |

## Credits and differences from the original

Emoji-style icons are [Twemoji](https://github.com/jdecked/twemoji), CC-BY 4.0. The mood faces,
the bean mascot, and about 60 glyphs that have no emoji equivalent (the emotion set, household
items, the moon-over-sea, the weight, the Zzz) are drawn here as SVG.

Deliberate differences:

- **No store.** The original sells character themes for an in-app currency; there is nothing to buy here.
- Brand logos in the original's Activities grid are replaced with generic media icons.
- A few picker icons are the nearest emoji to a hand-drawn original rather than an exact match.
- The filter sheet greys unselected chips, where the original shows them in colour — the grey/colour
  convention is applied consistently instead.

Personal reimplementation, not affiliated with or endorsed by the original app.
