# Music

Optional. The game runs perfectly silent without these files, and its sound effects are
synthesised in the browser, so they need no downloads at all.

Drop MP3s here with these exact names:

| File | Plays on |
|---|---|
| `menu.mp3` | home, how to play, setup, settings, question bank |
| `board.mp3` | the wheel and the crown screens |
| `question.mp3` | while a question is on screen |
| `victory.mp3` | the victory screen (plays once, does not loop) |

A missing file is not an error: the page checks what exists before it plays anything, and falls
back along `MUSIC_FALLBACK` in `src/03-engine.js` — `question` borrows `board`, `board` and
`victory` borrow `menu`. With none of them present nothing plays and nothing breaks.

Keep them small (about 1.5 MB each) and loop-friendly; browsers only allow sound after the first
click, so the first note arrives on the first interaction.

**Use music you have the right to use.** Original pieces, or tracks under a licence that allows
redistribution, with the licence noted here. Do not commit copyrighted music.
