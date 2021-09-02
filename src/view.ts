import { getPageCount, searchPage } from './service'

const pkg = require('../package.json')
const { name, version } = pkg

export function renderSearchPage(keyword?: any) {
  const pages = keyword ? searchPage(keyword) : null
  return /* html */ `
<h1>${name} v${version}</h1>
<p>total page count: ${getPageCount()}</p>

<label>keyword:</label>
<input type='text'>
<input type='submit'>

${
  pages &&
  /* html */ `

`
}
`
}
