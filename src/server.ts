import express from 'express'
import cors from 'cors'
import { print } from 'listening-on'
import { Raw } from './models'
import { storePage } from './service'
let pkg = require('../package.json')

let app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ name: pkg.name, version: pkg.version })
})

app.post('/page', (req, res) => {
  let page = req.body as Raw.Page
  console.log('storing page:', page.url)
  storePage(page)
  console.log('stored page:', page.url)
  res.json('ok')
})

let PORT = +process.env || 8090
app.listen(PORT, () => {
  print(PORT)
})
