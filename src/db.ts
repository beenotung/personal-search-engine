import DB from '@beenotung/better-sqlite3-helper'
import { toSafeMode } from 'better-sqlite3-schema'
import { join } from 'path'

export const db = DB({
  path: join('data', 'sqlite3.db'),
  migrate: {
    migrationsPath: 'migrations',
    table: 'migrations',
    force: false,
  },
})

toSafeMode(db)
