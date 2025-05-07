# Trelane
A semi-competent memorization app, named for that one character from _Star Trek_ cause why not.
I was struggling to pick between Mithril and Svelte, as both are fast and small.
However, I picked Mithril for its hyperscript component style, 
which is very similar to how I write UI code for my custom game engine, so it felt familiar.

## Features
- [X] Basic Card Editing
- [X] Saving Card Decks to JSON
- [X] Saving Card Decks to CSV
- [X] Saving Card Decks to Logseq Pages
- [ ] Saving Card Decks to a remote server
- [ ] Loading Decks from a remote server
- [x] Loading Decks from JSON
- [x] Loading Decks from CSV
- [x] Loading Multiple Decks from Memory
- [x] Learn Mode

## Building
You must have a npm compatible package manager installed.
1. Clone the repo.
2. Run `npm install` (or the equivalent) to install dependencies.
3. Run `npm run build` (or the equivalent) to create the bundled and minified version of the project. Note that while many output files are created, only `index.html`, `index.css`, and `index.js` are needed to run the app.

## Resources
- [Mithril Docs](https://mithril.js.org/)
- [Run a development server with live reload](https://til.jakelazaroff.com/esbuild/run-a-development-server-with-live-reload/)