import { Knex, knex as setupKnex } from 'knex'
import { env } from './env'

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: './db/app.db',
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: env.DATABASE_URL,
  },
}

export const knex = setupKnex(config)
