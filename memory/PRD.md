# PRD — All in: the Story of Rajsekhar

## Original Problem Statement
Build a single-page interactive web app that looks and feels like a real online poker table: dark green felt texture, overhead view, professional casino aesthetic, dark background with gold accents and ambient blue lighting. Page title at the very top in an elegant font reads "All in: the Story of Rajsekhar". Center of table shows a decorative chip stack and the tagline "Every Chapter Was a Bet". Six player seats arranged around the table, each with a circular avatar with initials, player name in a poker table-style font, and a small chip stack graphic. Seats: 1 the Wanderer, 2 the Dreamer, 3 the Fat King, 4 the Investor, 5 the Builder, 6 the Hustler. Clicking a seat highlights it with a golden glow and reveals green Bet (card icon) and red Fold buttons below the table. Bet opens a full-screen dark overlay with the chapter title in large text and typewriter-style letter-by-letter story text, subtle card-dealing animations, and a Back to Table button. Fold shows a funny red toast at the top for 3 seconds with a unique message per player. Premium feel like PokerStars/GG Poker but personal. Smooth CSS transitions everywhere, fully responsive for mobile, no lorem ipsum. User chose clearly-marked placeholders until they supply real stories/fold messages; chapter title = seat name; avatar initials W·D·F·I·B·H (default, no custom answer given).

## Architecture
- Pure frontend single-page app on the existing FARM template (React 19 CRA + craco). No backend routes, no database — content is static data by design.
- `frontend/src/data/players.js` — single source of truth: 6 players (id, seat, name, initials, chapterTitle, story, foldMessage). Content swaps happen here only.
- `frontend/src/components/PokerTable.js` — elliptical table (CSS ellipse rail + felt radial gradients + Unsplash felt texture at low opacity blend + dashed betting line), CSS chip stack, 6 absolutely-positioned seat buttons.
- `frontend/src/components/StoryOverlay.js` — fixed overlay, CSS slide-in/out, interval-based typewriter (26 ms/char, tap-to-reveal, Esc/back button close with exit animation), staggered card-deal keyframes using CSS custom-property final transforms.
- `frontend/src/components/FoldToast.js` — fixed top toast, slide down/up, auto-dismiss ~3 s (leaving at 2.6 s, unmount at 3.1 s).
- `frontend/src/App.js` — selection state (toggle), chapter overlay state, toast state.
- `frontend/src/App.css` — full bespoke stylesheet (Playfair Display / Oswald / Cormorant Garamond, gold #D4AF37, felt greens, blue ambient glows, grain overlay, reduced-motion support, 640 px mobile breakpoint).
- `public/index.html` — title, meta description, Google Fonts (original template script blocks preserved byte-for-byte).

## User Personas
- Rajsekhar (owner): turning personal history ("every chapter was a bet") into a shareable, cinematic single page; supplies the six stories and fold lines.
- Visitor/reader: clicks seats, reads chapters letter by letter, smiles at fold toasts; primarily on mobile.

## Core Requirements (static)
1. Casino poker-table look: dark felt ellipse, wood rail, gold accents, blue ambient light — done
2. Title header + center chip stack + tagline — done
3. Six named seats with initials avatars, names, chip graphics — done
4. Seat click → golden glow + Bet/Fold chip buttons — done
5. Bet → overlay: large chapter title, typewriter story, card-deal animation, Back to Table — done
6. Fold → unique red toast, 3 s — done (messages are marked placeholders)
7. Smooth CSS transitions/animations everywhere, responsive mobile — done
8. No lorem ipsum — placeholders are clearly marked [ PLACEHOLDER ] copy per user's choice

## Implemented (2026-01, build 1)
- All of the above, verified: desktop 1440×900 and mobile 390×844 screenshots (table, selected-seat glow, overlay mid-typewriter, fold toast, back-to-table round trip), zero horizontal overflow, correct page title served.

## Backlog / Next
- P0: Replace placeholder stories + fold messages in players.js when user sends real content.
- P1: Ambient sound design (chip clink on Bet/Fold, soft shuffle on overlay open).
- P1: Chapter progress tracker (gold chip badge on seats whose chapter has been read).
- P2: Voice narration of chapters; share-a-chapter card.
