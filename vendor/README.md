# vendor

Third-party libraries, committed on purpose so the game runs with no network at all.

| File | Version | Licence | Source |
|---|---|---|---|
| `react.production.min.js` | 18.3.1 | MIT | <https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js> |
| `react-dom.production.min.js` | 18.3.1 | MIT | <https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js> |
| `htm.js` | 3.1.1 | Apache-2.0 | <https://cdnjs.cloudflare.com/ajax/libs/htm/3.1.1/htm.js> |

These are unmodified copies. To move to a newer version, download it from the same place,
replace the file, bump the version in the comment in `src/02-config.js`, and run `node build.mjs`.

`../fonts/` holds Baloo 2 and Outfit the same way — the woff2 files Google Fonts serves, under
the SIL Open Font License, with `fonts.css` rewritten to point at them. Only the weights the
stylesheet actually uses are there (Baloo 2 at 700 and 800, Outfit at 400 to 900), in the latin
and latin-ext subsets.
