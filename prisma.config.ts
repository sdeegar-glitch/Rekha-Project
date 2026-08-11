import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // Migrations need a direct (non-pooled) connection; the app's runtime
  // client still connects via DATABASE_URL through the pooler (see db.ts).
  datasource: {
    url: env('DIRECT_URL'),
  },
})
