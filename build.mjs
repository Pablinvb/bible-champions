/*
 * Builds index.html from the fragments in src/.
 *
 *   node build.mjs
 *
 * src/ is the source. index.html is generated output — edit the fragments, not the
 * built file, or the next build overwrites your change.
 *
 * The fragments are not standalone modules: they are pieces of one page, pasted
 * together in the order below and wrapped in the HTML document this file defines.
 * They carry .js and .html extensions only so editors colour them.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = (...p) => join(here, "src", ...p);

/* Order matters. Config must come before the engine, questions before the
   engine closes the SEED array, and the screens last because they boot React. */
const FRAGMENTS = [
  src("01-styles.html"),   // <title>, fonts, the whole stylesheet
  src("02-config.js"),     // the cast, scoring, every UI string in both languages, opens SEED[
  src("questions", "10-prophecy.js"),
  src("questions", "11-history.js"),
  src("questions", "12-geography.js"),
  src("questions", "13-art.js"),
  src("questions", "14-sports.js"),
  src("questions", "15-economics.js"),
  src("questions", "16-riddles.js"),
  src("questions", "19-review.js"),
  src("03-engine.js"),     // closes SEED], audio, confetti, bank helpers, wheel, team card
  src("04-game.js"),       // host panel and the match itself
  src("05-screens.js"),    // home, how to play, setup, settings, question bank, app shell, boot
];

const HEAD = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Bible Champions: a team Bible trivia game. Spin the eight-slot wheel, answer from the Scriptures and collect all seven champions.">
<meta name="theme-color" content="#1b1047">
<meta property="og:title" content="Bible Champions">
<meta property="og:description" content="Explore the Bible. Collect the Champions. Win the Crown!">
<meta property="og:type" content="website">
<meta property="og:image" content="social-card.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.png" type="image/png">
<style>
  :root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
  body{margin:0}
  img{max-width:100%}
  [hidden]{display:none!important}
</style>`;

const joined = FRAGMENTS.map((f) => readFileSync(f, "utf8")).join("");
const split = joined.indexOf('<div id="root">');
if (split < 0) throw new Error('cannot find <div id="root"> — fragment order is wrong');

const page =
  '<!doctype html>\n<html lang="es">\n<head>\n' +
  HEAD + "\n" +
  joined.slice(0, split).trim() + "\n" +
  "</head>\n<body>\n" +
  joined.slice(split).trim() + "\n" +
  "</body>\n</html>\n";

const out = join(here, "index.html");
writeFileSync(out, page);
console.log(`index.html  ${(page.length / 1024).toFixed(0)} KB  from ${FRAGMENTS.length} fragments`);
