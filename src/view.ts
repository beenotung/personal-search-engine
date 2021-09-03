import { getPageCount, searchPage } from './service'

const pkg = require('../package.json')
const { name, version } = pkg

const template = ({
  title,
  body,
}: {
  title: string
  body: string
}) => /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body>
    ${body}
</body>
</html>
`

export function renderSearchPage(keyword?: any) {
  const pages = typeof keyword === 'string' ? searchPage(keyword) : null
  const title = pages ? 'Search: ' + keyword : 'Personal Search Engine'
  let body = /* html */ `
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
  `
  if (pages) {
    body += /* html */ `
  <div>${pages.length.toLocaleString()} matches</div>
    `
  }
  body += /* html */ `
</form>
`

  if (pages) {
    body += /* html */ `
<style>
#search-form {
  padding: 0.5em 0;
  position: sticky;
  top: 0;
  background-color: white;
}
#controls {
  padding: 1em 0;
  position: sticky;
  top: 3em;
  background-color: white;
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
<script>
function checkAll(checked) {
  document.querySelectorAll('form .checkbox-wrapper input').forEach(input => {
    input.checked = checked
  })
}
</script>
<form action="/delete" method="POST">
  <div id="controls">
    <button onclick="checkAll(true); return false">Select All</button>
    <button onclick="checkAll(false); return false">Unselect All</button>
    <input type="submit" value="Delete Selected" style="background: black; color: white">
  </div>
  <ol>`
    pages.forEach(page => {
      body += /* html */ `
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
    </li>`
    })
    body += /* html */ `
  </ol>
</form>
`
  }

  return template({ title, body })
}
