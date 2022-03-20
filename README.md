# personal-search-engine

A home-grown search engine for individual

## Feature

- Your search queries never leave your own device
- Personalized data sample
- You have full control over the database and searching logics
- Support multiple search logics (and, or, not, brackets)
- No 3rd-party tracking nor pushed advertisement

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

1. Start the server

```bash
npm start
```

2. Surf the internet with your browser, the visited pages are collected in the local search engine automatically.

## Searching

1. Go to http://localhost:8090
2. Enter search term, the click "search" or press enter key
3. The search result will be shown.
   You can also select and delete the pages in batch.

### Search Term

| Operator | Meaning            |
| -------- | ------------------ |
| +        | and                |
| ,        | or                 |
| -        | not (excluding)    |
| (        | Opening of a group |
| )        | Closing of a group |

### Example Queries

When searching with "`react + typescript - redux`", it will search for websites that include "react" and "typescript" but excluding those including "redux".

When searching with "`css module + (angular,react)`", it will treat "css module" as a single term. This query can be used when you want to find websites covering how to apply css module in (angular or react) application.
The spaces between operators are optional.

One more example, when search with "`typescript-google search`", it will search for websites that mention typescript but excluding google search result pages.

**Remark**: The search terms are case-insensitive

## TODO

- [ ] normalize high frequent fields to save disk space
- [ ] implement TF-IDF
