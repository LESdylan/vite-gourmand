const { defineConfig } = require('prisma/config');
const { config } = require('dotenv');
const { join } = require('path');

config({ path: join(__dirname, '../../../.env') }); // points to vite-gourmand/.env

module.exports = defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
    provider: 'postgresql',
  },
});
