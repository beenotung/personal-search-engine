export namespace Filter {
  export type Page = {
    id?: number
    url: string
    title: string
  }
}

export type FilterPageResult = 'skip' | 'store' | 'change'

export function filterPage(page: Filter.Page): FilterPageResult {
  if (page.url.match(/^http[s]?:\/\/(sso|account[s]?)\./)) {
    return 'skip'
  }
  if (page.url.startsWith('https://www.google.com/search?')) {
    const url = new URL(page.url)
    const skipKeyList = ['newwindow', 'sxsrf', 'ei', 'gs_lcp', 'ved']
    skipKeyList.forEach(key => url.searchParams.delete(key))
    url.search = url.searchParams.toString()
    const newUrl = url.toString()
    if (page.url !== newUrl) {
      page.url = newUrl
      return 'change'
    }
  }
  return 'store'
}
