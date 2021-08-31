// ==UserScript==
// @name         personal-search-engine
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  remove iframe from the page
// @author       Beeno Tung
// @include      http://*
// @include      https://*
// @grant        none
// ==/UserScript==

;(function () {
  'use strict'

  console.log('personal-search-engine v0.1')

  let skipMetaNameList = ['regionsAllowed', /:url/]
  let skipSelectorList = [
    'svg',
    'script',
    'iframe',
    'link',
    'style',
    '.TridactylStatusIndicator',
  ]

  function compare(a, b) {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  let meta_list = []
  document.querySelectorAll('meta[content]').forEach((meta, index) => {
    attr: for (let i = 0; i < meta.attributes.length; i++) {
      let attr = meta.attributes.item(i)
      if (attr.nodeName === 'content') continue
      let key = attr.nodeValue
      for (let skipName of skipMetaNameList) {
        if (key.match(skipName)) {
          continue attr
        }
      }
      let type = attr.nodeName
      let value = meta.attributes.getNamedItem('content').nodeValue
      meta_list.push({ index, type, key, value })
    }
  })
  meta_list = meta_list
    .sort((a, b) => compare(a.value, b.value) || compare(a.index, b.index))
    .filter((x, i, xs) => i === 0 || x.value !== xs[i - 1].value)
    .sort((a, b) => compare(a.index, b.index))
    .map(meta => {
      delete meta.index
      return meta
    })

  skipSelectorList.forEach(tag =>
    document.querySelectorAll(tag).forEach(e => e.remove()),
  )
  document.querySelectorAll('body *').forEach(e => {
    let styles = getComputedStyle(e)
    if (styles.display === 'none') {
      e.remove()
      return
    }
    if (e.tagName === 'IMG' && e.alt) {
      e.outerHTML = `<span>${e.alt}</span>`
      return
    }
    if (!e.textContent.trim()) {
      e.remove()
      return
    }
  })
  let text = Array.from(
    new Set(
      document.body.textContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line),
    ),
  ).join('\n')

  let title = document.title
  let url = location.href
  let data = {
    url,
    title,
    meta_list,
    text,
  }
  console.log('page data:', data)
  console.log('text length:', text.length)
})()
