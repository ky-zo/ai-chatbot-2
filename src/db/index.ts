import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

config({ path: '.env' })

export const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema, logger: true }) //not currently used
