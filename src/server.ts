import express from 'express'
import cors from 'cors'
import { print } from 'listening-on'
import { Userscript } from './models'
import { storePage } from './service'
import { filterPage } from './controller'
import { renderSearchPage } from './view'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.end(renderSearchPage())
})

app.get('/search', (req, res) => {
  res.end(renderSearchPage(req.query.q))
})

app.post('/page', (req, res) => {
  const page = req.body.page as Userscript.Page
  const result = filterPage(page)
  if (result === 'skip') {
    console.log('skip page:', page.url)
    res.json('skipped')
    return
  }
  console.log('store page:', page.url)
  storePage(page)
  res.json('stored')
})

app.use(express.static('public'))

const PORT = +process.env || 8090
app.listen(PORT, () => {
  print(PORT)
})
