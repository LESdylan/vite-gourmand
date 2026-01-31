import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '../../../.env') }); // <-- points to vite-gourmand/.env (up three levels)

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
    provider: 'postgresql',
  },
});
