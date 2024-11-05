import { config } from 'dotenv'
import { Config, defineConfig } from 'drizzle-kit'

// Load .env.local for local development, fallback to .env for production
config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' })

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    prefix: 'supabase',
  },
  verbose: true,
  strict: true,
  schemaFilter: ['public'],
}) satisfies Config
