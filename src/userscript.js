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
  let urlMatchSkipSelectorList = [
    [
      /.*/,
      [
        'svg',
        'script',
        'iframe',
        'link',
        'style',
        '.TridactylStatusIndicator',
        'noscript',
      ],
    ],
    [/https:\/\/www\.youtube\.com\/watch\?/, ['.playlist-items', '#related']],
  ]

  function compare(a, b) {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  let initialUrl = location.href

  function main() {
    let meta_list = []
    document
      .querySelectorAll(
        // the meta in body of youtube won't update when switching to other videos with client-side routing
        location.href === initialUrl ? 'meta[content]' : 'body meta[content]',
      )
      .forEach((meta, index) => {
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

    let body = document.createElement('body')
    body.innerHTML = document.body.innerHTML

    urlMatchSkipSelectorList.forEach(
      ([urlMatch, selectorList]) =>
        location.href.match(urlMatch) &&
        selectorList.forEach(selector =>
          body.querySelectorAll(selector).forEach(e => e.remove()),
        ),
    )
    if (location.href.startsWith('')) {
      body.querySelectorAll('.playlist-items')
      ;('#related')
    }
    body.querySelectorAll('*').forEach(e => {
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
        body.textContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line),
      ),
    ).join('\n')

    let title = document.title
    let url = location.href
    let page = {
      url,
      title,
      meta_list,
      text,
    }
    console.log('report page:', {
      title,
      url,
      text_length: text.length,
    })
    function upload() {
      fetch('http://localhost:8090/page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page }),
      }).catch(error => {
        console.error('failed to post page:', error)
        setTimeout(() => {
          requestIdleCallback(upload)
        }, 5000)
      })
    }
    requestIdleCallback(upload)
  }

  let lastUrl
  let lastTitle

  function wait(acc, url) {
    if (location.href !== url) {
      // call start() just in case popstate and hashchange is not triggered
      // e.g. when switch video in youtube
      start()
      return
    }
    // console.log('wait:', acc)
    if (acc <= 0) {
      main()
      return
    }
    requestIdleCallback(() => wait(acc - 1, url))
  }

  function start(event) {
    if (lastUrl === location.href && lastTitle === document.title) return
    lastUrl = location.href
    lastTitle = document.title
    console.log('start from:', event)
    wait(20, lastUrl)
  }

  window.addEventListener('popstate', start)
  window.addEventListener('hashchange', start)
  new MutationObserver(mutations => {
    start('dom mutation')
  }).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  })
  start('init')
})()
