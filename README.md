# Bible Champions

**Explore the Bible. Collect the Champions. Win the Crown!**

A team Bible trivia game for congregations, families and classrooms. Two to four teams spin an
eight-slot wheel, answer questions drawn from the Scriptures, and race to collect all seven
champions. Crown is the eighth slot: a wildcard that lets a team *choose* which champion it
wants — but it still has to answer for it.

Runs in any modern browser, on a laptop, a projector, a TV or a tablet. No install, no account,
no network once the page has loaded (React and htm come from a CDN on first load).

---

## Run it

Open `index.html` in a browser. That is the whole game.

For local testing with the same storage behaviour as the published site:

```bash
node serve.mjs
```

Then open <http://localhost:8099>.

## Build it

`src/` is the source; `index.html` is generated.

```bash
node build.mjs
```

That concatenates thirteen fragments in a fixed order and wraps them in the HTML document.
**Never edit `index.html` by hand** — the next build overwrites it. To publish, run the build,
commit, and push: GitHub Pages serves the repository root.

---

## The cast

| Slot | Champion | Subject |
|---|---|---|
| 1 | **Ezra**, the Vision Keeper | Bible Prophecies |
| 2 | **Caleb**, the Time Guardian | Bible History |
| 3 | **Jordan**, the Explorer | Geography |
| 4 | **Miriam**, the Melody Maker | Art |
| 5 | **Asher**, the Champion | Sports |
| 6 | **Levi**, the Merchant | Economics |
| 7 | **Eli**, the Wise One | Riddles |
| 8 | **Crown**, the Golden Wildcard | — not collectable |

## How a match runs

- The wheel picks the subject. **A correct answer keeps the turn** — the team spins again, up to
  the number of spins in a row set at setup (3 by default; set it to 1 to turn chaining off).
  The turn only passes when a team misses.
- A correct answer scores by difficulty: **easy 100 · medium 200 · hard 300**.
- Answers in a row pay a **streak bonus**: +50 for two, +100 for three, +150 from four on. A
  wrong answer puts the streak back to zero.
- Enough correct answers in one subject (1, 2 or 3 — your choice at setup) win that champion,
  worth **+150**.
- Landing on **Crown** opens the crown challenge: the team picks any champion it is *missing*
  and answers one special question from that subject. Right, the champion is won immediately,
  whatever the normal requirement is, and the team scores the question plus **+200** plus the
  unlock bonus. Wrong, nothing is won and the turn passes. **Crown never gives a champion away.**
- A subject whose champion a team already holds still scores points; champions are never
  duplicated.

### How it ends

Three settings, chosen at setup and changeable mid-match from the host panel:

- **With all seven** (the default) — the first team to collect every champion wins, and the
  match stops there.
- **After rounds** — 3, 5 or 8 rounds. A round is one turn each, however many spins a turn ran to.
- **On the clock** — 10, 15, 20 or 30 minutes. The clock stops while the match is paused, and
  when it reaches zero the turn in progress is still played out: the team in the chair is never
  cut off mid-question. It just cannot chain another spin.

Rounds and the clock finish **on points**: most champions first, score as the tie-break. The
host can also end any match early with **End and declare a winner**, which settles it the same
way. Collecting all seven still wins outright in every mode.

If two or more teams are dead level at the top — same champions, same score — the match goes to
**sudden death** instead of being called a draw. Each tied team answers one question of its own:
whoever gets it right stays in. More than one survivor and the survivors go again; none at all
and the same teams go again. No points, no champions and no streak are at stake, only staying in.

### Lifelines

Five of them. Every team starts with one of each and never holds more than three of the same one.

| Lifeline | What it does |
|---|---|
| **Scroll** | +30 seconds to look it up in the Bible |
| **Ask a team** | 15 seconds to consult another team, with the question clock paused |
| **Bomb** | Clears the wrong options until only one is left beside the answer |
| **Second chance** | Absorbs the first wrong answer: that option is struck out and the team tries again on the same clock |
| **Skip** | A different question from the same subject, on a fresh clock |

With **Earn lifelines** on (the default), a team is given one more — picked at random from the
ones it is not full on — for every three correct answers in a row and for every crown challenge
won. Turn it off at setup for a strictly one-of-each match.

### Projector mode

**Settings → Projector mode**, or the same switch in the host panel. Question text, answers,
team names, scores and the standings all grow for a screen the whole room reads from the back,
and the host's own small print — hints and keyboard legends — gets out of the way. It is
remembered on the device, so a hall laptop stays set up.

### On the board

A card announces each change of turn. Under the turn bar, a strip ranks the teams live —
champions first, points as the tie-break — because with four teams in the four corners the race
is otherwise hard to read. Each team card counts its score up rather than jumping, floats the
points it just won, and carries a bar under every medallion showing how close that champion is
(when more than one correct answer is needed).

Spin with the hub, with `space`, or by flicking across the wheel on a touch screen. The wheel
runs five to seven turns, never quite the same length twice, and notches as the pointer crosses
each slot.

Keyboard: `space` spins and advances, `A`–`D` or `1`–`4` answer, the gear opens the host panel.

## Host panel

The gear in the top bar opens it mid-match: pause and resume, skip a question, change the active
team, correct a score, grant or remove a champion, hand a team another lifeline (or ↺ to put its
whole set back to one each), change the timer, difficulty, language, unlock requirement, spins in
a row or lifeline earning, read the answer log, restart or exit. Anything that cannot be undone
asks for confirmation first.

---

## The question bank

146 verified questions ship with the game, in **Spanish and English** — every question carries
both languages, its scripture citation and a short explanation, so switching language never
shrinks the bank. 140 of them are the subject bank, 20 each, balanced across easy, medium and
hard. The other six sit in `src/questions/17-doctrine.js`.

Those six are kept apart on purpose. They answer points of doctrine and chronology — the year
the Kingdom was established, the year Jerusalem fell, where the faithful will live, competitive
sport, how the work is financed, what the soul is — so they do not come from a plain reading of
a single verse the way the rest do. Each one was checked against its own page on jw.org before
being switched on. **If the published explanation ever changes, that is the file to review
first.** Any question can be put back under review by setting `verified:false` on its row, or by
switching it to *Needs review* in the bank editor; a match set to *Only verified questions* —
the default — then never draws it.

### Sources

Wording, spelling and answers were checked against [jw.org](https://www.jw.org): the
*New World Translation of the Holy Scriptures* (2019 Spanish revision) for the verses, and the
site's own pages for the six on doctrine and chronology — *¿Qué indica la cronología bíblica
sobre el año 1914?*, *¿Será destruida la Tierra?*, *¿Qué es el alma?* and *¿Cómo se financia la
obra de los testigos de Jehová?*

Where the Spanish edition differs from other translations the game follows jw.org:
*Apocalipsis* (not Revelación), *Armagedón*, *Boaz*, *Asahel*, *Ahimáaz*, and *adivinanza* for
Samson's riddle.

### Editing

The **Question bank** screen (from the main menu) can create, edit, delete, search and filter by
subject, difficulty and review state, and import or export the whole bank as JSON or CSV. The
bank lives in the browser's local storage, so each device keeps its own edits; *Restore original
bank* brings back the shipped one.

**Row shape** (what the game stores):

```js
{ id, cat, dif, a, verified,
  en: { q, o:[a,b,c,d], e, ref },
  es: { q, o:[a,b,c,d], e, ref } }
```

`a` is the 0-based index of the correct option and is shared by both languages, so the two
option lists must stay in the same order.

**CSV columns** (import and export):

```
id, category, difficulty, answer, verified,
scripture_en, question_en, a_en, b_en, c_en, d_en, explanation_en,
scripture_es, question_es, a_es, b_es, c_es, d_es, explanation_es
```

`answer` is the letter `A`–`D`. Import also accepts a plain single-language row —

```json
{ "id": "BIB-001", "category": "Biblical Prophecies", "difficulty": "Medium",
  "language": "en", "question": "…", "options": ["…","…","…","…"],
  "correctAnswer": 1, "scripture": "Micah 5:2", "explanation": "…", "verified": false }
```

— and copies it into both languages. A category may be given as the internal id (`prophecy`) or
as the subject name in either language. Rows with a bad category, fewer than four options or no
answer are dropped silently, so check the count the toast reports.

---

## Source map

| File | What lives there |
|---|---|
| `src/01-styles.html` | `<title>`, Google Fonts, the whole stylesheet including the colour tokens |
| `src/02-config.js` | the cast, scoring, lifelines, every player-facing string in both languages; opens `var SEED=[` |
| `src/questions/*.js` | question rows, one file per subject plus `17-doctrine.js`. Pure data |
| `src/03-engine.js` | closes `SEED]`, then storage, audio, confetti, starfield, bank filtering, CSV/JSON import-export, the wheel, the team card |
| `src/04-game.js` | host panel and the match: turns, timer, answering, Crown, lifelines, victory |
| `src/05-screens.js` | home, how to play, setup, settings, question bank editor, app shell, React boot |

Everything else is output or assets: `art/` (eight champion portraits), `audio/`, `favicon.png`,
`social-card.jpg`, `index.html`.

The fragments are **order-dependent**: `02-config.js` opens the `SEED` array, the question files
are its rows, `03-engine.js` closes it. `build.mjs` splits the joined text on `<div id="root">`
to decide what belongs in `<head>`; that div is the first line of `02-config.js`.

### Storage

Four keys, per browser: `bc.bank`, `bc.settings`, `bc.audio`, `bc.match`. A half-finished match
survives a reload — the home screen then offers *Continue match*. When you add a field to the
team or match object, backfill it in the restore path in `App` (`src/05-screens.js`) or a
returning user opens a broken match.

### Music

Drop MP3s into `audio/` named `menu.mp3`, `board.mp3`, `question.mp3`, `victory.mp3`. Missing
files fall back along `MUSIC_FALLBACK` in `src/03-engine.js`; the game runs perfectly silent.
Sound effects are synthesised in the browser, so they need no files at all.

---

## Content guidance

The game is built for a Jehovah's Witnesses setting. Questions are drawn from the Bible text
itself and cite the verse they come from; doctrinal and chronological points are kept out of the
verified bank and flagged for the host instead. There are no images of God, no cross as a symbol,
and nothing violent or occult in the art or the wording.
