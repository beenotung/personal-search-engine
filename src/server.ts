import express from 'express'
import cors from 'cors'
import { print } from 'listening-on'
import { Userscript } from './models'
import { storePage, deletePages } from './service'
import { filterPage } from './controller'
import { renderSearchPage } from './view'
import debug from 'debug'

const log = debug('search-engine:server.ts')
log.enabled = true

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  renderSearchPage(res)
})

app.get('/search', (req, res) => {
  renderSearchPage(res, req.query.q)
})

app.post('/page', (req, res) => {
  const page = req.body.page as Userscript.Page
  const result = filterPage(page)
  if (result === 'skip') {
    log('skip page:', page.url)
    res.json('skipped')
    return
  }
  log('store page:', page.url)
  storePage(page)
  res.json('stored')
})

app.post('/delete', (req, res) => {
  const page_id_list = Object.keys(req.body)
  log('delete pages:', page_id_list)
  deletePages(page_id_list)
  res.redirect('/')
})

app.use(express.static('public'))

const PORT = +process.env || 8090
app.listen(PORT, () => {
  print(PORT)
})
