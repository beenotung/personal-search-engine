import { getPageCount, searchPage } from './service'
import type { Response } from 'express'

const pkg = require('../package.json')
const { name, version } = pkg

function startHTML(res: Response, title: string) {
  res.write(/* html */ `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
body {
  font-family: Sans-serif;
}
#search-form {
  padding: 0.5em 0;
  position: sticky;
  top: 0;
  background-color: white;
}
#controls {
  padding: 1em 0;
  position: sticky;
  top: 3.5em;
  background-color: white;
}
@media (prefers-color-scheme: dark) {
  body,
  #search-form,
  #controls {
    background-color: black;
  }
  body {
    color: #c7c7c7;
  }
  a {
    color: #eb9595;
  }
  a:visited {
    color: #9ed789;
  }
  a:hover {
    color: #f2d0d0;
  }
}
.title {
  font-size: bolder;
  margin: 0.25em 0;
}
input[type=checkbox] {
  width: 1.25em;
  height: 1.25em;
  margin: 0.5em;
}
li {
  margin-bottom: 0.5em;
}
li > div {
  display: flex;
}
.checkbox-wrapper {
}
    </style>
</head>
<body>
  `)
}

function endHTML(res: Response) {
  res.write(/* html */ `</body></html>`)
  res.end()
}

export function renderSearchPage(res: Response, keyword?: any) {
  const pages = typeof keyword === 'string' ? searchPage(keyword) : null
  const title = pages ? 'Search: ' + keyword : 'Personal Search Engine'

  startHTML(res, title)

  res.write(/* html */ `
<h1>${name} v${version}</h1>
<p>total page count: ${getPageCount()}</p>

<form id="search-form" action='/search' method='GET'>
  <label>keyword:</label>
  <input type='text' name='q'>
  <script>
      let params = new URLSearchParams(location.search)
      let q = params.get('q')
      if (q) {
        let form = document.querySelector('form')
        form.q.value = q
      }
  </script>
  <input type='submit' value="Search">
  `)
  if (pages) {
    res.write(/* html */ `
  <div>${pages.length.toLocaleString()} matches</div>
    `)
  }
  res.write(/* html */ `
</form>
`)

  if (pages && pages.length > 0) {
    const padding = pages[0].id.toString().length / 2 + 1
    res.write(/* html */ `
<script>
function checkAll(checked) {
  document.querySelectorAll('form .checkbox-wrapper input').forEach(input => {
    input.checked = checked
  })
}
function toggleAll() {
  document.querySelectorAll('form .checkbox-wrapper input').forEach(input => {
    input.checked = !input.checked
  })
}
let rangeFrom = ''
let rangeTo = ''
function checkByRange() {
  let from = +prompt('Select range inclusively from id: ', rangeFrom)
  if (from) {
    rangeFrom = from
  }
  let to = +prompt('Select range inclusively to id: ', rangeTo)
  if (to) {
    rangeTo = to
  }
  if (from < to) {
    loop(from, to)
  } else if (from > to) {
    loop(to, from)
  }
  function loop(from, to) {
    for (let i = from; i <= to; i++) {
      let input = document.querySelector('form li[value="'+i+'"] .checkbox-wrapper input')
      if (input) {
        input.checked = true
      }
    }
  }
}
</script>
<form action="/delete" method="POST">
  <div id="controls">
    <button type="button" onclick="checkAll(true)">Select All</button>
    <button type="button" onclick="checkAll(false)">Unselect All</button>
    <button type="button" onclick="toggleAll()">Toggle Selection</button>
    <button type="button" onclick="checkByRange()">Select by Range</button>
    <input type="submit" value="Delete Selected" style="background: black; color: white">
  </div>
  <ol style="padding-inline-start: ${padding}em">`)
    pages.forEach(page => {
      res.write(/* html */ `
    <li value="${page.id}">
      <div>
        <div class="checkbox-wrapper">
          <input type="checkbox" name="${page.id}">
        </div>
        <div>
          <div class="title">${page.title}</div>
          <a href="${page.url}">${page.url}</a>
        </div>
      </div>
    </li>`)
    })
    res.write(/* html */ `
  </ol>
</form>
`)
  }
  endHTML(res)
}
