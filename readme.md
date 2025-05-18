<center>
    <h1>Trelane</h1>
</center>

A semi-competent memorization app, named for that one character from _Star Trek_ cause why not.
I was struggling to pick between Mithril and Svelte, as both are fast and small.
However, I picked Mithril for its hyperscript component style, 
which is very similar to how I write UI code for my custom game engine, so it felt familiar.

## Features
- [X] Basic Card Editing
- [X] Saving Card Decks to JSON
- [X] Saving Card Decks to CSV
- [X] Saving Card Decks to Logseq Pages
- [x] Saving Card Decks to a remote server
- [x] Loading Decks from a remote server
- [x] Loading Decks from JSON
- [x] Loading Decks from CSV
- [x] Loading Multiple Decks from Memory
- [x] Learn Mode

## Building
### Client
You must have a npm compatible package manager installed.
1. Open the `client/` folder.
2. Run `npm install` (or the equivalent) to install dependencies.
3. Run `npm run build` (or the equivalent) to create the bundled and minified version of the project.
### Desktop
You must have [Tauri's dependencies](https://tauri.app/start/prerequisites/) installed. 
1. Follow the above steps to build the client. 
2. Open the `desktop/` folder.
3. Run `make` to build the desktop app.
### Server
Good luck lol

## Resources
- [Mithril Docs](https://mithril.js.org/)
- [Run a development server with live reload](https://til.jakelazaroff.com/esbuild/run-a-development-server-with-live-reload/)
- [Esbuild TS config](https://eisenbergeffect.medium.com/an-esbuild-setup-for-typescript-3b24852479fe)
- And of course, ChatGPT