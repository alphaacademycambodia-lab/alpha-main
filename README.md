# Alpha Academy Cambodia — Website

Static, dependency-free HTML/CSS/JS site for **Alpha Academy Cambodia** (home & online tutoring, Phnom Penh).

## Files

```
index.html        Home — hero, services, why-choose-us, subjects, levels, process, testimonials, CTA
services.html     Services — formats, home tutoring, online classes, subjects, languages, levels, FAQ
about.html        About — story, mission/vision/values, why choose us, approach, tutor screening
learning.html     Learning hub — subject cards linking to the free revision resources
grade-12-math-formula.html
                  Grade 12 maths formula book (Khmer) — 12 chapters, MathJax, search, contents drawer
grade-12-complex-number.html
                  Grade 12 complex numbers — lesson + 40 exercises, Khmer and English
grade-12-limit.html
                  Grade 12 limits — lesson + 36 multiple choice + 15 written, Khmer and English
grade-12-derivative.html
                  Grade 12 derivatives — lesson + 13 written exercises, Khmer and English
grade-12-differential-equation.html
                  Grade 12 differential equations — first and second order, lesson
                  + 36 multiple choice + 62 written, Khmer and English
grade-12-integral.html
                  Grade 12 integrals — lesson + 18 multiple choice + 10 written, Khmer and English
grade-12-probability-exercise.html
                  Grade 12 probability — lesson + 108 exercises, Khmer and English
cambridge-lower-secondary-maths-7.html
                  Cambridge Lower Secondary Mathematics Stage 7 — all 30 units
                  and 3 section reviews, each with objectives, a summary, key
                  terms, worked examples, common mistakes and graded exercises.
                  540 questions with answers, 171 inline SVG diagrams, progress
                  tracker and editable notes, saved in the reader's own browser.
                  The guide cannot be copied or downloaded out of the page — the
                  material stays the school's. English (Cambridge syllabus)
khmer-kindergarten.html
                  Khmer for Kindergarten (ages 4–6) — the 33 consonants with
                  their series, the 23 vowel signs on both series, building
                  syllables, ជើងអក្សរ, first words, Khmer numerals, everyday
                  phrases, and seven games that need no sound to play
math-kindergarten.html
                  Maths for Kindergarten (ages 4–6) — numbers 0–20 as digits,
                  Khmer numerals and ten-frames, shapes and patterns,
                  comparing and measuring, adding and taking away within ten,
                  the clock, the riel, position words, and eight picture games
english-kindergarten.html
                  English for Kindergarten (ages 4–6) — ABC and letter sounds,
                  numbers, colours, shapes, first words, phonics, everyday
                  phrases, and seven picture games. Reads itself aloud
chinese-kindergarten.html
                  Chinese for Kindergarten (ages 4–6) — first characters, the
                  four tones, numbers, colours, shapes, first words, everyday
                  phrases, and seven picture games. Spoken by a Chinese voice
hsk1-test.html    HSK 1 chapter tests — 15 tests following HSK Standard
                  Course 1 lesson by lesson, plus a final paper. Behind the
                  registration gate
chinese-beginner.html
                  Chinese for Beginners — pinyin, sound, writing, numbers,
                  words and conversation, with audio on every line
tools.html        Tools hub — the fourth top-level tab, listing the free tools
calendar.html     Cambodia Holiday Calendar — a whole year with the public
                  holidays marked, the list underneath, and a print layout
date-calculator.html
                  Date Calculator — add or subtract days, weeks, months and
                  years from any date, before or after, with the answer marked
                  on a calendar. Runs entirely in the browser
countdown.html    Countdown — days, hours, minutes and seconds to any date and
                  time, or to one of the Cambodian public holidays and the
                  other dates people count to, with a celebration at zero
unit-converter.html
                  Unit Converter — length, weight (with the Cambodian gold
                  weights chi and damlung) and temperature, both directions
scientific-calculator.html
                  Scientific Calculator — trig in degrees or radians, log, ln,
                  powers and roots, n!, nCr/nPr, ×10ˣ and Ans, with keyboard
                  shortcuts and a history of answers for the open tab
contact.html      Contact — details, enquiry form, opening hours, map, quick FAQ
404.html          Not-found page
robots.txt        Crawler rules
sitemap.xml       Sitemap (update <loc> if the domain changes)
assets/css/chinese.css Chinese page — tabs, syllable tiles, writing pad, word lists, dialogues
assets/css/kids.css    All four kindergarten pages — big tiles, flip cards, the game screen
assets/css/math-kids.css
                       The maths page only — number cards, ten-frames, the
                       number line, sum rows, number bonds, riel notes, scenes
assets/css/khmer-kids.css
                       The Khmer page only — the Khmer face and its leading,
                       the series colours, the vowel table, the syllable grid
assets/js/kids-core.js The kindergarten engine all four pages run on — voice,
                       flip cards, contents rail, tab strip, the whole game round
assets/js/khmer-kg-bank.js
                       Khmer course content — 33 consonants with series and
                       example words, 23 vowel signs on both series, the
                       independent vowels, subscripts, 70 words in 8 themes,
                       the numerals and everyday phrases
assets/js/khmer-kindergarten.js
                       Khmer modules and games — the join between bank and engine
assets/js/math-kg-bank.js
                       Maths course content — 0–20 in three notations, shapes
                       and solids, patterns, opposites, number bonds, the days,
                       o'clock, riel notes, position words, ordinals
assets/js/math-kindergarten.js
                       Maths modules and games — the join between bank and engine
assets/js/kindergarten-bank.js
                       English course content — alphabet, numbers, colours,
                       shapes, 80 words in 8 themes, word families, sight words, phrases
assets/js/english-kindergarten.js
                       English modules and games — the join between bank and engine
assets/js/chinese-kg-bank.js
                       Chinese course content — 26 first characters, numbers,
                       colours, shapes, 80 words in 8 themes, the four tones, phrases
assets/js/chinese-kindergarten.js
                       Chinese modules and games — the join between bank and engine
assets/css/hsk.css     HSK pages — the registration gate and the chapter cards
assets/js/aa-gate.js   The registration gate: sign-up before the tests open
assets/js/hsk1-bank.js HSK 1 content — 15 lessons, their words, their grammar
                       notes and 196 questions
assets/js/hsk1-bank-km.js
                       The Khmer half of the HSK 1 bank, an overlay keyed on
                       lesson and question position
assets/js/hsk1-test.js HSK 1 page — chapter cards, saved scores, runs the quiz
assets/css/tools.css   The Tools tab — the hub grid, the date calculator, the
                       holiday calendar and its print stylesheet, and the
                       countdown with its confetti
assets/js/countdown.js The countdown — the clock, the event list built from
                       kh-holidays.js, the celebration and the confetti
assets/js/sci-calc.js  The scientific calculator — tokens, a parser (no eval),
                       exact degree trigonometry, the keypad and the history
assets/js/date-calculator.js
                       The date calculator — the arithmetic, the result panel
                       and the calendar. No dependencies, nothing stored
assets/js/kh-holidays.js
                       THE HOLIDAY LIST. Cambodian public holidays, fixed and
                       movable, with the Khmer names. Read its header before
                       touching a date — these are set by sub-decree
assets/js/holiday-calendar.js
                       Draws the year grid and the holiday list from that file
assets/js/kh-observances.js
                       The other days on the calendar — international and
                       national days, Meak Bochea, Chinese New Year, Mid-Autumn,
                       Kan Ben, the Buddhist holy days (ថ្ងៃសីល) and shaving
                       days (ថ្ងៃកោរ) — matching khmer-lunar-calendar.com
assets/css/style.css   Full design system — tokens, light/dark themes, components, responsive rules
assets/js/boot.js      Render-blocking: stamps the saved theme + language on <html> before first paint
assets/js/i18n.js      Khmer dictionary and the English ⇄ ខ្មែរ swap
assets/js/main.js      Theme + language wiring, nav, sticky header, scroll reveal, counters, form handling
assets/js/chinese-bank.js
                       Chinese course content — tones, syllables, characters, numbers, words, dialogues
assets/js/chinese-beginner.js
                       Chinese page behaviour — speech, pinyin stacking, writing pad, drills
assets/img/logo.png    Logo (copied from the supplied PNG)
```

No build step, no frameworks. Open `index.html` in a browser to preview.

## Themes

Every page carries a sun/moon button in the header. The choice is stored under
`aa-theme` in `localStorage` and applied by `boot.js` in `<head>`, so there is no
flash of the wrong theme on the next page load. Until the visitor picks one
explicitly, the site follows the operating system's `prefers-color-scheme`.

Colours live in two blocks at the top of `assets/css/style.css`: `:root` for
light and `:root[data-theme="dark"]` for dark. The dark block inverts the
neutral `--ink-*` ramp instead of renaming it, so `--ink-900` still means "the
strongest text colour" in both themes and existing rules keep working. The
footer is the one exception — it is dark in both themes, so it uses the pinned
`--footer-bg`.

## Languages (English ⇄ ខ្មែរ)

English is written directly into the HTML, so the pages are still correct with
JavaScript disabled. Khmer lives only in `assets/js/i18n.js`, keyed by short
ids referenced from the markup:

```html
<h2 data-i18n="home.svcH2">Three ways to learn with Alpha</h2>
<input data-i18n-placeholder="ctc.ph.name">
<button data-i18n-aria="common.toggleTheme">
```

On the first switch to Khmer the original English is stashed on the element, so
switching back is loss-free even for strings containing inline markup. The
choice is stored under `aa-lang`.

To add a string: give the element a `data-i18n="..."` attribute and add the same
key to the `KM` object in `i18n.js`. A key with no Khmer entry simply stays in
English rather than going blank.

### Khmer in JavaScript-generated pages

`data-i18n` only reaches markup that is in the HTML file. Anything a script
writes needs its own dictionary, and there are three patterns in use — pick the
one that matches, rather than inventing a fourth:

| where | pattern |
|---|---|
| page furniture a script writes (`quiz-engine.js`, `aa-gate.js`, `kids-core.js`) | a local `T` object of `{en, km}` pairs and a `t()` that reads `AAi18n.get()` |
| lesson content that is bilingual by nature (the kindergarten banks) | `km` beside `en` on each entry in the bank |
| a large English bank that needs a Khmer twin (`hsk1-bank.js`) | a separate overlay file keyed on position — see `hsk1-bank-km.js` |

**The quiz engine is fully bilingual.** Every label it draws comes from its own
`T` block, and a bank may supply `qkm`, `whykm` and `optskm` beside `q`, `why`
and `opts`; where they are missing the English is used. Switching language
mid-test relabels in place and redraws the current question — the answers live
on the Quiz object, so nothing is lost. That is why `paintResults()` is
separate from `finish()`: redrawing the results screen in the other language
must not fire `onFinish` again and save the score a second time.

**What is still English on purpose.** The Grade 12 formula book is Khmer-only
by design. The periodic table keeps element names and symbols in English
because that is how they are examined. The English tenses and grammar banks ask
about English, so their question text is the material itself — only the chrome
around them is translated. And the quiz's keyboard hint names the physical keys
(Enter, Backspace), which are printed in English on the keyboard.

The formula book's chapter content is Khmer-only by design (it is a Khmer
reference); the switch changes the surrounding chrome.

## Contact details used

- Phone / Telegram: **+855 93 792 767**
- Email: **alphaacademycambodia@gmail.com**

These appear in the header, footer, floating action buttons and contact page of every page. To change them, search for `85593792767` and `alphaacademycambodia@gmail.com` across the `.html` files and `assets/js/main.js`.

## Contact form

The form has no backend. By default it validates the fields, then opens the visitor's mail client with everything pre-filled to `alphaacademycambodia@gmail.com`. It also has a honeypot field to absorb bots.

To send submissions straight to an inbox without the mail-client step, sign up for a forwarding service (Formspree, Web3Forms, Google Apps Script, etc.) and set the endpoint near the top of the form section in `assets/js/main.js`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
```

With that set, the form POSTs in the background and falls back to the mail client if the request fails.

## Deploying

**Any static host** — upload the whole folder as-is:

- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, or connect a repo. No build command; publish directory is the folder root.
- **GitHub Pages** — push the folder contents to a repo, enable Pages on the branch root.
- **cPanel / shared hosting** — upload to `public_html/`.

**Google Sites** cannot host raw HTML pages like these — it only accepts embedded HTML in a code block, which strips most of this. If Google Sites is a requirement, use one of the static hosts above and point the domain there instead.

After deploying, point `www.alphaacademycambodia.com` at the host and submit `sitemap.xml` in Google Search Console.

## Things worth customising

- **Testimonials** (`index.html`) are written as realistic placeholders. Replace with real quotes before going live, or delete the section.
- **Statistics** in the hero and About page (`12+ subjects`, `100% personalised`) are safe claims drawn from the service list — swap in real numbers (students taught, years operating) when you have them.
- **Opening hours** on `contact.html` are a sensible default (Mon–Sun 8:00–20:00). Adjust to the real schedule.
- **Map** on `contact.html` centres on Phnom Penh. Replace the iframe `src` with a pinned Google Maps embed once there's a public office address.
- **Colours** all live in the `:root` block at the top of `assets/css/style.css` — the blues are sampled from the logo gradient. Change a token there and check it in both themes.
- **Learning resources** (`learning.html`) ship with Mathematics live and the Science / Languages cards marked "Soon". When a new sheet is ready, drop the page in, add a `<a>` to the right `.topic-list`, and remove the `is-soon` class and `badge-soon` span.

## Complex numbers

`grade-12-complex-number.html` is one page with two views behind a switch —
**Lesson** and **Exercises** — both drawn from `assets/js/complex-bank.js`.

The bank carries **both languages in the same object**, `km` beside `en`, and
the maths is written once in TeX because it reads the same either way:

```js
{ t:'p', km:'…', en:'…' }          // paragraph
{ t:'m', tex:'z = r(\\cos\\alpha + i\\sin\\alpha)' }   // display formula
{ t:'eg', km:'…', en:'…', steps:['…','…'] }            // worked example
```

Exercises follow the same idea — `q:{km,en}` and parts `t:{km,en}` — plus
`src` for a past-exam year and `extra: true` for the practice questions
written for this page rather than taken from the book. Part labels are stored
once as `a`, `b`, `c` or `1`, `2`, `3` and printed as ក ខ គ in Khmer and
(a) (b) (c) in English.

Nine lesson sections cover \\(i\\) and the algebraic form, the four
operations, powers of \\(i\\), the conjugate, modulus and argument, polar
form, de Moivre, the \\(n\\)th roots and quadratics in \\(\\mathbb{C}\\).
Exercises 1–30 come with the chapter (several are past national examination
questions); 31–40 were written for this page.

MathJax typesets after every redraw, including after a language change —
`complex-number.js` calls `typesetPromise` at the end of `paint()`. The
`content-box` rule for `mjx-*` in `complex.css` is the same fix the formula
book needs; don't remove it.

## Limits

`grade-12-limit.html` is the same two-view page as complex numbers and shares
its stylesheet — `complex.css` serves both, which is why the limits markup is
also `cx-*`. Content is in `assets/js/limit-bank.js`, again `km` beside `en`
with the maths written once in TeX.

The bank has three parts: `lesson` (7 sections), `mc` (36 multiple-choice) and
`exercises` (15 written). **The multiple-choice questions live in the
Exercises view**, above the written ones, per the brief.

```js
{ n: 12, kind:'mc', q:{km,en}, o:['\\frac{1}{2}','\\frac{7}{4}', …] }
```

The printed source has **no answer key**, so an option is never marked right
or wrong — clicking one records it as the student's choice (localStorage
`aa-lim-picks`), clicking it again clears it, exactly like ticking and
un-ticking the printed box. Done-marks live separately in `aa-lim-done`, keyed
`m12` / `w7` so multiple-choice 12 and written 7 never collide.

Written exercises 1–7 come from the book; 8–15 were written for this page and
are badged as extra practice.

## Derivatives and integrals

These two pages are the limits page generalised. `assets/js/math-lesson.js` is
the renderer for both: it reads whatever the bank file loaded before it puts on
`window.MATH_BANK`, so adding another maths topic is a bank file plus a copy of
the HTML with the script tag swapped — no new renderer.

```js
global.MATH_BANK = { key: 'deriv', lesson: LESSON, mc: [], exercises: WR };
```

`key` is the only thing that has to be unique: it namespaces the page's
localStorage (`aa-deriv-done`, `aa-deriv-picks`) so ticks on one page never
show up on another. An empty `mc` is fine — the renderer drops the
multiple-choice block and its heading when the bank has none, which is why the
derivative page shows a single flat list of exercises.

| page                       | bank                | lesson | mc | written |
|----------------------------|---------------------|-------:|---:|--------:|
| `grade-12-derivative.html` | `derivative-bank.js`|      8 |  0 |      13 |
| `grade-12-integral.html`   | `integral-bank.js`  |      8 | 18 |      10 |

Both share `complex.css` like limits does, and both are bilingual in the same
`{km,en}` shape.

**On sourcing.** The 120-page PDF was sampled, not transcribed end to end. The
lesson text on both pages is written for this site from the standard Grade 12
syllabus. Integral multiple-choice 8–14 are from the book; the rest of the
multiple choice, and all but two of the derivative exercises (those two carry
`src:'book'`), were written for this page and are badged as extra practice.
As with limits there is **no answer key**, so choices are recorded, never
marked.

## Differential equations

`grade-12-differential-equation.html` carries **two chapters of the workbook on
one page** — មេរៀនទី៦ (first order) and មេរៀនទី៧ (second order) — because for
the student they are one topic. It uses the shared `math-lesson.js` renderer
with `assets/js/differential-bank.js`.

| part      | contents |
|-----------|----------|
| `lesson`  | 8 sections: 5 first order, 3 second order |
| `mc`      | 36 — 1–20 first order, 21–36 second order |
| `exercises` | 62 — 1–30 first order, 31–62 second order |

Numbering runs straight through both halves so a done-mark can never mean two
different exercises. Written 56–62 are past national examination questions
(2014–2021) and carry `src: 'bac …'`.

Everything on this page is transcribed from the source workbook — the lesson,
all 36 multiple-choice questions and all 62 written exercises. As elsewhere,
the book has **no answer key**, so a chosen option is remembered but never
marked right or wrong.

## Probability

`grade-12-probability-exercise.html` now has **two panes** — Lesson and
Exercises — chosen by the tab bar at the top, so it borrows `complex.css` and
loads MathJax alongside its own `probability.css`.

- `assets/js/probability-lesson-bank.js` — the lesson, 14 sections in the same
  `{km,en}` block shape the other maths pages use: sets, the sum and product
  principles, the counting principle, permutations (plain, with repetition,
  circular, distinguishable), combinations and the binomial theorem, then
  sample space, the definition of probability and its properties, counting-based
  probability, conditional probability, independence, and total probability
  with Bayes.
- `assets/js/probability-bank.js` — 108 exercises as data, one object each:

```js
{ n: 12,                       // its number in the source book — a stable id
  q: 'the stem…',
  p: [ { k: 'ក', t: '…', s: [ { k: 'ក', t: '…' } ] } ] }   // s = nested parts
```

`n` 1–68 are the main collection (មេរៀនទី ៤ ប្រូបាប); 69–86 are the
supplementary set (ផ្ទៀកលំហាត់); 87–108 are the practice set that follows the
lesson above (មេរៀនទី៨ ប្រូបាប), of which 101–108 are past national
examination questions, 2014–2021.

**The running order is fixed, not random.** `probability-exercise.js` holds an
explicit `ORDER` array of book numbers — deliberately mixed so the exercises
are not in book order, but identical for every visitor, so a teacher can set
"number 12" and mean the same exercise for the whole class. Nothing is
reshuffled at runtime.

To reorder, edit `ORDER`. To add an exercise, give it the next free `n` in the
bank and add that `n` to `ORDER`; anything missing from `ORDER` is appended at
the end rather than dropped. Ticked-off exercises live in `localStorage`
(`aa-prob-done`) keyed on `n`, so progress survives any change to `ORDER`.

**Both languages.** The Khmer in `probability-bank.js` is the original;
`probability-bank-en.js` is an overlay keyed on the same `n`, so the two can
never drift apart — it only says the same exercise in English. Part labels
map ក→(a), ខ→(b), ១.→1. and so on. An exercise with no overlay entry stays in
Khmer rather than going blank, and the search box looks through both
languages whichever one is on screen. The page redraws on `aa:langchange`,
so the header's EN ⇄ ខ្មែរ control switches the exercises themselves, not
just the buttons around them.

The exercises were transcribed from PDFs that carry no text layer (the Khmer
is drawn as vector outlines), so the text was read from rendered pages rather
than extracted. Obvious typing slips in the source were normalised; one
duplicate survives on purpose — exercise 51 prints the same wording for parts
ក and ខ, and guessing the intent would have been worse than reproducing it.

The author card at the foot of the page uses `assets/img/nat-bunchhai.jpg`,
the same photo now shown in the credit block of the formula book.

## HSK 1 chapter tests

`hsk1-test.html` — fifteen tests, one per lesson of *HSK Standard Course 1*,
plus a final paper. 196 questions in `assets/js/hsk1-bank.js`, run through the
shared `quiz-engine.js` that the English tenses and grammar pages already use.
Best score per chapter lives in `localStorage` under `aa-hsk1-best`.

**Where the content came from.** Both source PDFs are image-only scans — 150
JPEG pages, no text layer, no fonts, produced by FreePic2Pdf — so nothing could
be extracted programmatically. The pages were read visually instead. The lesson
numbering, titles, per-lesson word lists and grammar notes all come from the
book's own Contents (pp. 13-18) and Vocabulary index (pp. 120-125), so the
tests line up with the book exactly. **The questions themselves were written
for this page**, using only words a student has met by the end of that lesson.

**One convention in the bank.** The right answer is always written first, so a
question can be checked at a glance while editing. `shuffleQ` in
`hsk1-test.js` permutes the options and moves `ans` to wherever the right one
landed, which is what stops the answer always being A on screen. If you add a
question, put the right answer at index 0 and leave `ans: 0`.

### The registration gate

`assets/js/aa-gate.js`. A student gives a name and email before the tests open;
the details are remembered on that device under `aa-user` and sent on to the
academy.

**Be clear about what this is.** The site is static — no server, no database —
so this is a sign-up, not a login. It captures who is studying and it keeps a
casual visitor out. It does **not** secure anything: anyone who opens the
browser console can clear the flag and walk in. If the tests ever need to be
genuinely restricted, that needs real accounts (Firebase Auth, Supabase or
similar), which cannot live in a file on a static host.

The details go the same two ways the contact form's do — POST to
`FORM_ENDPOINT` if one is set, otherwise the visitor's mail client, opened in
a new tab so a half-finished registration is not lost. **Set the endpoint in
two places**, `main.js` and `aa-gate.js`, and both start posting silently:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
```

Until you do, every registration opens the student's mail client, which many
will simply close — so setting it is the first thing to do before sharing the
page. Only the HSK tests are gated; everything else on the site stays open.

## Tools

`tools.html` is a top-level tab beside Learning, and it is a hub for the same
reason Learning is one: the tab has to lead somewhere when there is more than
one thing behind it. Its dropdown lists the tools directly, so the hub is
never in the way of someone who knows what they came for.

A tool here is held to three rules. It does **one** job. It needs **no account
and no network** — the calculation happens in the browser, nothing is uploaded
and nothing is stored. And it is **bilingual like everything else**, which for
a tool means the numbers too: Khmer numerals when the page is in Khmer, not
just Khmer labels around Latin digits.

### Cambodia Holiday Calendar

`calendar.html` + `assets/js/holiday-calendar.js`, with the holidays themselves
in `assets/js/kh-holidays.js`. Two views off one set of data, and a print
stylesheet so either can go on a wall.

- **Year** (the default) — twelve small months, holidays highlighted. This is
  the planning view: when to close, when to book, how the year falls.
- **Month** — the wall calendar. Cells big enough to print the holiday's name
  *inside* the day it falls on, with "day 2 of 3" on the multi-day ones. Below
  640px the names drop out and the list underneath does the naming, because
  seven columns on a phone cannot carry text.

One pair of arrows drives both: a year at a time on the year view, a month at
a time on the month view, rolling over the year end. The holiday list and the
day count follow whichever view is showing, and a three-day holiday that spans
a month end appears in both months' lists.

**The month view also carries the Khmer lunar date** — ៦កើត under each day, the
lunar month named on its first day, and ខែចេត្រ · ឆ្នាំរោង ឆស័ក ព.ស. ២៥៦៨ under
the month heading. That comes from `assets/js/kh-lunar.js`; see below.

### The Khmer lunar date

`assets/js/kh-lunar.js` converts a Gregorian date to its Khmer lunar date. The
moon-day and month arithmetic is the Suriyeatr (សុរិយាត្រ) reckoning, ported
from `seanghay/khmercal` — transcribed, not approximated. Three things about it
are worth knowing before editing.

**It is verified, not assumed.** The port is checked against known dates before
it ships: 14 April 2024 = ៦កើត ខែចេត្រ (the momentkh documentation), and the
full moons that Visak Bochea 2023/2024 and the Water Festival 2023/2024 fall
on. The epoch offset (`ANCHOR`) was *solved for* against those, not guessed.

**It has no clock in it.** The original shifts a timestamp by seven hours to
land in Cambodian time and then rounds a millisecond difference, which makes
the answer depend on the reader's own time zone — for a calendar that is a
bug, since a Khmer date must read the same in Phnom Penh and in Paris. Here
every date is reduced to `Date.UTC(y, m, d) / 86400000`, a whole number of
days, so there is no time of day anywhere in the arithmetic.

**The year names are counted, not derived, and the rule is contested.** The two
published implementations disagree with each other on the animal/sak
transition, so the cycle is anchored on a documented fact — 2024 is ឆ្នាំរោង
ឆស័ក — and stepped. On when ព.ស. turns there is genuinely no single answer:
the Khmer calendar reference at tovnah.com says opinions differ. The religious
reckoning turns it at Visak Bochea; everyday Cambodian usage turns it at Khmer
New Year, which is why Khmer New Year 2026 is printed everywhere as ព.ស. ២៥៧០.
This page follows everyday usage, so the animal year, the sak and ព.ស. all turn
on the same day.

**It does not decide public holidays.** The lunar date of the full moon of
ពិសាខ is astronomy; the public holiday is whatever the sub-decree says, and the
two can differ. Holidays stay in `kh-holidays.js`.

Everything is cached per year — without that a single month view walks decades
of year lengths 42 times over and takes minutes rather than milliseconds.

**The important thing here is not the calendar, it is the data.** Cambodian
public holidays are confirmed each year by a sub-decree (អនុក្រឹត្យ) of the
Royal Government. That document is the authority — not this repository. Two
kinds of day sit on it:

- **Fixed** — 1 January, 8 March, Khmer New Year in April, 1 May, the two royal
  birthdays, 24 September, 15 and 29 October, 9 November. Same Gregorian date
  every year, so they are encoded once in `FIXED` and appear for any year.
- **Movable** — Visak Bochea, the Royal Ploughing Ceremony, Pchum Ben and the
  Water Festival follow the Khmer lunar calendar and move every year.

**The movable dates are deliberately empty.** They cannot be derived by
arithmetic and they are not guessed. Until a year is entered into `YEARS` from
its sub-decree, the page lists those four by name with their lunar rule, under
a heading that says the date is set annually, and the grid shows an amber
notice that only the fixed dates are marked. A holiday calendar printing a
plausible-but-wrong Pchum Ben is worse than one printing nothing: the wrong
date gets believed and put in a diary.

Adding a year is one object — `source` plus the four ISO dates — and the header
of `kh-holidays.js` shows the exact shape. A three-day holiday is stored by its
first day and `len`, and spans a month end correctly, so Pchum Ben starting on
30 September still marks 1 and 2 October.

### Date Calculator

`date-calculator.html` + `assets/js/date-calculator.js`. Add or subtract years,
months, weeks and days from a date, in either direction, with the answer marked
on a calendar. Four decisions are worth knowing before editing it.

**The answer is live; there is no Calculate button.** Every keystroke
recomputes. That is how these are actually used — nudging a number until the
date looks right — and a submit button turns each nudge into two actions. The
result panel is `role="status" aria-live="polite"` so a screen reader follows
along instead of being left behind.

**Months are not a fixed length, and the page says so.** 31 January plus one
month has no honest answer. Every calendar clamps it to 28 February and so does
this one — but it also *tells you it did*, in the amber note under the result.
Naive `setMonth` arithmetic silently returns 3 March, and that is the classic
bug in date calculators. The order is years, then months (clamped), then whole
days, so `1 month + 30 days` and `30 days + 1 month` are genuinely different
answers and the page documents which one it gives.

**Dates are three integers, never a parsed string.** `new Date('2026-03-01')`
is UTC midnight and lands on the previous day west of Greenwich;
`new Date(2026, 2, 1)` is local midnight and is always the day you meant.
Differences are then measured through `Date.UTC` so a daylight-saving jump
cannot turn 90 days into 89 — Cambodia has no DST, a visitor's laptop might.

**The calendar is always six rows.** A grid that changes height as you page
through months is hard to scan, so short months are padded with the
neighbouring days rather than collapsing the row.

The arithmetic is worth testing whenever it is touched. It can be driven
headlessly against a stub DOM — set the date input's value, fire the direction
button's click handler, then read the ISO date the Copy button carries — which
covers the clamp cases, the leap years, the year boundaries and the order of
operations without needing a browser.

### Countdown

`countdown.html` + `assets/js/countdown.js`. Days, hours, minutes and seconds
to any date and time, or to an event from the list, and a celebration when it
lands. It loads `kh-holidays.js` as well as its own script. Five things are
worth knowing before editing it.

**The moment is the point.** A countdown that reaches zero and shows four
zeros has failed at the one job it had, so at zero the panel turns over, the
confetti fires once, a chime plays and the clock carries on the other way. The
celebration also fires for anyone opening the page **within a day** of the
event — someone visiting on New Year's morning is not late. The confetti is
pure CSS and the chime is Web Audio, so both work offline, and both are
skipped under `prefers-reduced-motion`.

**The clock is read, never accumulated.** Every tick recomputes
`target - Date.now()` and then schedules itself to the next whole second. A
`setInterval(1000)` that adds a second per firing drifts, and drifts badly
once a browser throttles the background tab to one tick a minute; this way a
tab left open all night is exact the moment it is looked at again.

**Nothing is stored, so the URL is the storage.** The Tools page promises
nothing is uploaded and nothing is stored, so the target goes in the address
bar instead — `#t=2027-04-14`, plus `e=` for a preset or `n=` for a name. That
makes a countdown bookmarkable and sendable without keeping a byte anywhere.
Deep links work: `countdown#e=cny` opens Chinese New Year.

**The event list has one source of truth and one rule.** The Cambodian
holidays are read out of `kh-holidays.js`, so a holiday is spelt the same here
as on the calendar. Its four lunar holidays have no Gregorian date until the
year's sub-decree is entered there, so they are **named and explained rather
than counted down to**. Chinese New Year is a published table (`CNY`, 2026–35)
for the same reason: it is the second new moon after the winter solstice in
Chinese standard time, which is astronomy, not arithmetic — and when the table
runs out the event stops being offered instead of being extrapolated. Add
years to `CNY` when you need them.

**Only the seconds move, and nothing is a live region.** A ticking clock
behind `aria-live` would be read aloud sixty times a minute, so the only
announced element is the celebration line, and it is written only when it
changes. The badge beside each event uses the same whole-days-of-elapsed-time
measure the clock does rather than counting calendar days, because "in 33
days" beside a clock reading 32 looks like one of them is broken.

### Scientific Calculator

`scientific-calculator.html` + `assets/js/sci-calc.js`, styles in section 7
of `tools.css`. The calculator a Grade 12 student is allowed in the exam
room. Four things are worth knowing before editing it.

**There is no `eval()`.** Each key press pushes one token (`sin` shows as
`sin(`), and a small recursive-descent parser turns the list into a number.
That is why ⌫ removes a whole function in one press, why an impossible answer
can say exactly what is wrong (divide by zero, log of a negative, tan 90°,
n! of a fraction), and why a pasted link can never run code.

**It follows the Casio order**, because that is what students already trust:
brackets and functions, then x² x³ x⁻¹ ! %, then ^ ˣ√ ᴇ (right to left),
then a leading minus, then nCr nPr, then multiplication with no sign, then
× ÷, then + −. So −3² = −9, 2^3^2 = 512 and 1÷2π = 1÷(2π). Missing closing
brackets at the end are added; an extra one is an error.

**Degree trigonometry is exact at the angles students use.** The angle is
reduced first and multiples of 30°, 45° and 90° are answered exactly, so
sin 180° is 0 rather than 1.2×10⁻¹⁶, and tan 90° is refused rather than
printed as a sixteen-digit number. Results are kept to 15 significant digits
(so 0.1 + 0.2 = 0.3) and shown to 10.

**The address bar is the only memory.** After `=` the calculation goes in
the hash (`#x=sin(,3,0&a=rad`), so a working can be sent to a classmate. The
history panel lives only as long as the tab. `window.AASciCalc.evaluate(tokens,
mode)` exposes the parser for testing without the page.

## The four kindergarten pages

`english-kindergarten.html`, `chinese-kindergarten.html`,
`math-kindergarten.html` and `khmer-kindergarten.html` are one page in four
subjects, and they share an engine rather than a copy of one.

```
kids-core.js          the voice, the flip cards, the tab strip, the contents
                      rail, the scroll spy, the whole game round, the saved
                      scores, the confetti — nothing subject-specific
  ├── english-kindergarten.js  + kindergarten-bank.js
  ├── chinese-kindergarten.js  + chinese-kg-bank.js
  ├── math-kindergarten.js     + math-kg-bank.js
  └── khmer-kindergarten.js    + khmer-kg-bank.js
```

Scores are namespaced per page — `aa-kg-best`, `aa-zkg-best`, `aa-mkg-best`,
`aa-kkg-best` — so a child's stars on one never appear on another.

A page hands the engine its tabs, a `panel(key)` that returns the HTML for a
module, its list of games, and its praise and nudge lines; the engine does the
rest. `KidsCore.start()` returns the engine so a page can reach its voice.

Fixing a bug in the game round therefore fixes it on both pages. Adding a
module to one page does not touch the other. Both share `kids.css`.

Four seams let a page extend the engine without the engine knowing anything
about the subject:

- `cfg.click(near, target)` — extra click handlers, called before the
  fall-through that simply speaks anything carrying `data-say`. The English
  page uses it for the blend-it-together row, the two language pages for the
  vocabulary group buttons, and the maths page for counting along out loud.
- `cfg.playP` — replaces the blurb above the game menu. The default one counts
  seven games out loud, and the maths page has eight.
- `data-flip` is a **pipe-separated list of what to say**, so `A|Apple` reads
  the letter, a beat, then the word, while `人` just reads the character.
- an option may carry `cls`, which is how the Chinese page gets its characters
  set in a Chinese face without the engine having heard of Chinese.

**Two class names to leave alone.** The shared stylesheet already owns `.sub`
(the nav dropdowns, which are `visibility:hidden` until hovered) and `.card`,
`.tabs`, `.grid`, `.opt`. Everything here is `kg-*` for that reason, and the
one time it was not — a `.sub` for the pinyin under a game answer — the answer
silently vanished. Note also that several `kg-*` rules set `font-family`
directly, so `.kg-wrap .kg-hz` has to match their specificity and sit at the
end of the file to win.

## English for Kindergarten

`english-kindergarten.html` is written for a student who cannot read yet, and
almost everything unusual about it follows from that.

Seven modules — **ABC, 123, Colours & Shapes, Words, Sounds, Talk, Play** —
all rendered from `assets/js/kindergarten-bank.js` by
`assets/js/english-kindergarten.js`, and reachable two ways: the tab strip
across the top and the **contents rail on the left**, exactly as on the
Chinese page. Deep links work: `english-kindergarten#play` opens the games.

The rail lists all seven modules and expands the open one into its sections,
which are read back out of the panel after it renders — the labels come from
each `.kg-sec` heading, so the rail cannot drift from the page. Only the open
module lists sections, because scrolling to a heading inside a module that is
not on screen would mean nothing. From 1080px the rail is a sticky left
column; below that it is a drawer above the lesson, closed by default and
closing again once something is picked.

**The alphabet is a flashcard deck.** The front of a card is the letter alone;
tapping turns it over to the picture and says "A … Apple". Showing both at
once — which the first version of this panel did — lets a child read the
answer off the card instead of recalling it, which is the whole point of a
flashcard. The phonics badge and the two speaker buttons sit *under* the card,
outside the flipping part, so the sound of a letter never needs a turn to
reach. Turning a card back is silent, so flipping a whole row back is not a
wall of noise, and **Show every picture / Turn them all back** flip the deck
for a teacher running a drill. Under `prefers-reduced-motion` the card still
turns over, it just does not spin to get there.

**Everything reads itself aloud.** There are no audio files. Every card is a
speaker button that calls `speechSynthesis` with the device's English voice,
and the toolbar reports which voice was found. Two rules when editing content:

- Every word in the bank needs an `em` (emoji). The picture is not decoration —
  it is how a question is asked to someone who cannot read the words.
- `say` on a letter is *not* its phoneme. A browser voice reads `b` as its name
  "bee", so the phonics sound has to be written as `buh`. That trailing schwa
  is the sound as it is taught in most kindergartens, but it is an
  approximation; `ph` holds the proper notation printed on screen. A real voice
  in the room is still better, and the page says so in the parent tips.

**The games.** Seven of them, ten questions each, all multiple choice with four
huge picture answers: listen-and-find, first letter, which letter says…?, how
many?, find the colour, find the shape, and read the word. Each generator draws
its questions fresh from the bank, so a round is never the same twice.

A wrong tap is never an ending. It says "try again" and hands the card back;
after two tries the right answer starts glowing and the child taps it to move
on. Every round therefore finishes. The star is what records whether the answer
was right first time, and the best round per game is kept in `localStorage`
under `aa-kg-best`. There is no timer and no percentage — a four-year-old who
feels told off stops playing.

The three sound effects are built with the Web Audio API rather than shipped as
files, so they work offline. Confetti is pure CSS and is skipped entirely under
`prefers-reduced-motion`.

**Khmer.** The hero, the parent guidance and the CTA use `data-i18n` keys
(`kg.*` in `i18n.js`). Everything else — word meanings, module headings, the
tips, the game names — is bilingual inside the bank and the page script as
`{en, km}` pairs, the same shape the probability bank uses, so the two
languages cannot drift apart. The page repaints on `aa:langchange`, which is
the only way the Khmer glosses printed inside each card can follow the switch.

**On the Khmer glosses.** Roughly 200 of them were written for this page rather
than taken from a book. They are ordinary, everyday words and should be read
over by a native speaker before the page goes in front of a class.

## Chinese for Kindergarten

`chinese-kindergarten.html` is the English page's twin, and only three things
differ. All three are the language rather than the design.

**Speak characters, never pinyin.** A zh-CN voice reads 你好 correctly but
would read `nǐ hǎo` as Latin letters, so every `data-say` and every game prompt
is hanzi. Pinyin is printed and never spoken, which is also why an entry in
`chinese-kg-bank.js` without an `hz` cannot be spoken at all. The page harness
asserts this: it walks every `data-say`, `data-flip` and answer label looking
for Latin letters, and finding one is a bug.

**The flashcard runs the other way up.** The English deck hides the picture and
shows the letter, because there the child is learning what A sounds like. Here
the front carries the character and its pinyin and what is hidden is the
meaning — because that is the thing being recalled.

**Tones replace phonics.** There is nothing to blend, but there is the one
thing a Khmer speaker most needs drilling on, so the fifth module is the four
tones — four groups of ordinary words plus the 妈/麻/马/骂 contrast that shows
why the tone is not decoration — and the game set trades "which letter says…"
for "which tone".

The seven games are listen-and-find, which character (picture → single
character), which tone, how many, find the colour, find the shape and read the
word (picture → multi-character word). The tone game draws only from
single-syllable entries: the tone of a two-character word is two answers, and
the question would then have no right one.

Scores live under `aa-zkg-best`, separate from the English page's `aa-kg-best`,
so a child's stars on one do not appear on the other.

**On the Khmer and the pinyin.** Both were written for this page rather than
taken from a book. Have a native speaker read the Khmer, and a Mandarin speaker
check the tone marks, before the page goes in front of a class.

## Maths for Kindergarten

`math-kindergarten.html` is the third page on the same engine, and the one
place it departs from the other two is the point of it.

**A number is shown three ways at once.** English and Chinese are subjects a
child learns *in* a language; maths is not — four is four whether the child
says "four" or reads ៤. So every entry in `math-kg-bank.js` carries the digit,
the **Khmer numeral**, the English word and the Khmer word, and the number
cards print the first three together with a ten-frame. Matching `4`, `៤` and
four dots to each other is the most useful thing on the page, and no other
page on this site teaches the Khmer numerals at all.

**The voice still speaks English**, for the same reason the Chinese page uses a
zh-CN voice: a Khmer speech voice is on almost no phone in Cambodia while an
English one is on nearly all of them, and a maths page that cannot count out
loud is a worksheet. Everything spoken is also printed in Khmer underneath.

Six modules — **Numbers, Shapes, Compare, Adding, Taking away, Day & money** —
plus the games. Beyond the counting and arithmetic the last module carries the
things a maths question assumes a child already has: the days of the week,
o'clock, the riel notes, the position words (in, on, under, behind, in front
of, next to, between) and the ordinals. The position cards are drawn rather
than captioned — the cat really is inside, on top of or behind the box — since
a caption saying so would be no use to a child who cannot read it.

**Eight games**: how many?, find the number, add them up, take some away, more
or fewer, find the shape, what comes next?, and before and after. Digit answers
carry the Khmer numeral underneath, so every game quietly drills `4 = ៤`
whatever else it is asking. Scores live under `aa-mkg-best`, separate from the
other two pages.

Four extra visual kinds ride in on the `cls` an option or a question already
carries, so none of them needed a change to `kids-core.js`: a heap of pictures
as an answer, the sum in a question, the Khmer numeral under a digit and the
pattern strip.

**One trap worth knowing.** In a repeating-pattern question the distractors
must differ from the answer *and* from each other: an `AAB` unit starts and
continues with the same picture, so slicing the unit blindly offers the right
answer twice and then marks the right tap wrong. `collect()` in the pattern
game exists only to prevent that.

## Khmer for Kindergarten

`khmer-kindergarten.html` is the fourth page on the engine and the one whose
design is dictated by something outside it.

**Assume there is no voice.** A Khmer speech voice ships with Chrome for
Android carrying Google Text-to-Speech and with very little else, so on most
phones in Cambodia this page is silent. The `km` profile in `kids-core.js`
hunts for one anyway and the toolbar says what it found — but *nothing on the
page may depend on the answer*. That is why **all seven games are answered by
looking**, not by listening: where the English page opens a round with "listen
and find", a silent device would give a child ten questions with no way in.
The voice here is a bonus, never the mechanism. If you add a game, that is the
rule to keep.

**A bare vowel sign rides on a dotted circle.** ា is a combining mark, not a
letter: printed alone it vanishes or lands on the character before it. `sign()`
prefixes U+25CC to produce ◌ា, which is also exactly how a Khmer school book
prints one. Every vowel shown without a consonant goes through that function —
the vowel cards, the grid headers and the answers in the vowel game.

**The series is the lesson, so it is a colour.** Every consonant carries `s: 1`
or `s: 2`, and first and second series are tinted `--kk-s1` and `--kk-s2`
wherever they appear. This is not decoration: the same vowel sign says two
different sounds depending on the series of the consonant in front of it, so
each of the 23 vowel cards shows the sign on ក *and* on គ with both readings.
A child taught one sound per sign has to unlearn half of it later.

**Khmer stacks, so it needs leading.** A subscript hangs below the baseline and
a vowel can sit above it. Every Khmer run on the page carries `.kk-km`, which
sets Kantumruy Pro at `line-height: 1.75`; set tighter, ខ្ញុំ collides with the
line above and the page looks broken to the only people who can read it.

**Six modules** — ព្យញ្ជនៈ, ស្រៈ, ការផ្សំ, ពាក្យ, លេខ, និយាយ — and seven games:
which letter does it start with, find the picture, read the word, find the
vowel, Khmer numerals, read the colour, and what comes next in the alphabet.
Two letters, ឋ and ឍ, appear almost only in Pali and Sanskrit borrowings;
rather than invent a chart word for them the bank marks them `rare`, the card
says so, and the games leave them out.

**On the romanisation.** Every card carries one so an adult who does not read
Khmer can say the word, and it follows no official system — Cambodia has
several and none of them is what a parent reads. It is a handrail; the Khmer
is the authority. Both the romanisation and the two readings on each vowel
card were written for this page and should be read over by a Khmer teacher
before the page goes in front of a class.

## Chinese for Beginners

`chinese-beginner.html` is six modules — pinyin, sound, writing, numbers, basic
words and conversation — reachable two ways: the tab strip across the top and
the **contents rail on the left**, which lists each module with its sections
underneath. Every group folds away with its chevron, the whole rail folds away
with the Hide button, and the section you are reading is highlighted as you
scroll. From 1080px the rail is a sticky left column; below that it becomes a
folded block above the lesson, closed by default and closing again after you
pick something. Deep links work: `chinese-beginner#words` opens that module.

The rail is read back out of the panels after they render — the section titles
come from the `<h3>` of each `.zh-sec`, so it cannot drift from the page. That
is why all six panels are built on load rather than lazily.

The Pinyin module opens with a **sound-only chart**: tones, initials and finals
as bare squares with no example words, each one speakable. Because a voice
cannot read Latin letters, every square carries a hidden character with that
reading (`chart` in the bank) — `b` plays 波 "bo", `ang` plays 昂. Two finals,
`-eng` and `-ong`, never stand alone, so they are played inside 灯 and 东; the
footnote under the chart says so.

**Audio.** There are no audio files. Every speaker button calls the browser's
own speech synthesis (`speechSynthesis`) with the device's Chinese voice —
Chrome, Edge and Safari all have one, and the toolbar reports which voice was
found, or warns when there is none. Two rules matter when editing the content:

- Speak **characters, never pinyin.** A zh-CN voice reads 你好 correctly but
  would read `nǐ hǎo` as Latin letters. Every `data-say` value is hanzi.
- In `assets/js/chinese-bank.js`, `hz` may contain punctuation but `py` holds
  **only the pinyin syllables separated by single spaces**. The renderer stacks
  one syllable over one character, so the counts must match once punctuation is
  removed. If they do not, the phrase falls back to a single pinyin line above
  it — nothing breaks, but the alignment is lost.

**The writing pad** is two stacked canvases in a 米-grid: the target character
(drawn faint as the tracing guide) and the student's ink. Both are canvases
precisely so that **Check** can compare them as bitmaps:

- both are reduced to a 100×100 mask, each grown by a 5-cell tolerance;
- *coverage* = how much of the character the ink reached, *precision* = how
  much of the ink landed on it, and the score is their harmonic mean — so
  scribbling over the whole square cannot score well on coverage alone;
- the ink is then repainted **green** where it sits on the character and
  **red** where it strays, and the parts of the character never written are
  overlaid in **amber** — a missing stroke is invisible otherwise, because
  nothing the student drew was wrong.

The guide and the mask both go through `paintChar()`, so they always line up,
and the guide is redrawn once `document.fonts.ready` resolves — otherwise the
mask would be measuring a fallback font the student never saw.

It checks the *shape*, not the stroke order. The stroke count is reported
separately as a second signal, and the order itself is given in words next to
each character.

**Khmer.** Page furniture is translated through `data-i18n` keys (`zh.*` in
`i18n.js`). Word meanings and dialogue translations come from the `km` field on
each entry in the bank and swap over with the language toggle; the grammar
explanations are English, as on the other lesson pages.

## The formula book

`grade-12-math-formula.html` renders with MathJax 3 (CHTML) from a CDN. It uses
the shared site header and footer, with its own sticky toolbar underneath
holding the contents drawer, search and print buttons.

One thing to keep in mind when editing its inline `<style>`: MathJax sizes the
pieces of √ and ∛ — the surd glyph, the overbar it draws as a `border-top`, and
the cube-root index — with explicit widths and heights that assume the CSS
default `box-sizing: content-box`. The page's global `border-box` reset applies
to MathJax's own elements too and knocks those radicals out of alignment, so
there is a rule putting MathJax's subtree back on `content-box`. Don't remove
it, and don't add padding or borders to `mjx-*` elements.

The page's classes are namespaced `fx*` (`.fxcard`, `.fxhero`, `.fxstats`,
`.fxtag`) precisely because the shared stylesheet already owns `.card`, `.hero`,
`.stats` and `.tag`.
