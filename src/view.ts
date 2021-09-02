import { getPageCount, searchPage } from './service'

const pkg = require('../package.json')
const { name, version } = pkg

let template = ({
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
  let title = pages ? 'Search: ' + keyword : 'Personal Search Engine'
  let body = /* html */ `
<h1>${name} v${version}</h1>
<p>total page count: ${getPageCount()}</p>

<form action='/search' method='GET'>
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
  <input type='submit'>
</form>
`

  if (pages) {
    body += /* html */`
<style>
li {
    margin-bottom: 0.5em;
}
</style>
<ol>`
    pages.forEach(page => {
      body += /* html */ `
  <li value="${page.id}">
    ${page.title}
    <br>
    <a href="${page.url}">${page.url}</a>
  </li>`
    })
    body += `
</ol>`
  }

  return template({ title, body })
}
