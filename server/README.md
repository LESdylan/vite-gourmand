```ps
cd C:\Users\dylan\Documents\ECF\vite-gourmand\server
nest new vite-gourmand-api
```

- choose npm when prompted
- This creates teh folder `vite-gourmand-api` with everything NestJS needs (including `tsconfig.json` and start scripts)

We enter the new folder
`cd vite-gourmand-api`

we install all the dependencies we already picked ( with --legacy-peer-deps)
```js
npm install @nestjs/config@^3 --legacy-peer-deps
npm install @nestjs/jwt@11 passport passport-jwt bcrypt --legacy-peer-deps
npm install @nestjs/mongoose@11 mongoose --legacy-peer-deps
npm install class-validator class-transformer --legacy-peer-deps
npm install @prisma/client prisma --legacy-peer-deps

```

`npm run start dev` --> inside the folder

# To diagnose if the .env is recognized or not
node -e "require('dotenv').config({ path: '../../.env' }); console.log(process.env.DATABASE_URL)"
