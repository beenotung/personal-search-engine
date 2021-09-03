# personal-search-engine

## Installation
1. Install the server
```bash
git clone https://github.com/beenotung/personal-search-engine.git
cd personal-search-engine
npm install    # or pnpm install
```
2. Setup userscript to collect data when you surf the internet
(Copy `src/userscript.js` into tampermoney script editor, and setup it to run only on top-level frame.)

## Start Data Collection
```bash
npm run dev
```

## Searching
1. Go to http://localhost:8090
2. Enter search term, the click "search" or press enter key
3. The search result will be shown.
You can also select and delete the pages in batch.

## TODO

- [ ] normalize high frequent fields to save disk space
- [ ] allow multiple search logics (and, or, not, brackets)
