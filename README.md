## Overview

This project consist of to repositories:
 - [express-api](https://github.com/MishaDenisenko/express-api)
 - [react-client-app](https://github.com/MishaDenisenko/react-client-app)

## 

This is a full-stack application. The backend is built with Node.js using the Express.js framework. MongoDB was chosen as the database, and database queries are performed using Prisma ORM.

The frontend is written in React with TypeScript, using the Vite template. The frontend leverages several technologies, the main ones being:

- [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started)
- [Tailwind CSS](https://tailwindcss.com/docs/installation)
- [Next.UI](https://nextui.org/docs/guide/installation)

Docker files and a `docker-compose.yml` file have also been developed, allowing you to build and run the entire project in just a few short steps.
  

## Instruction to run service

- Download [express-api](https://github.com/MishaDenisenko/express-api)
- Add `.env` file in the root of express-api project
- Paste this code there.
  
```sh
DATABASE_URL="mongodb://USERNAME:PASSWORD@HOST/DATABASE?authSource=admin&directConnection=true"

SECRET_KEY=123 // your secret key
```
- Then change `DATABASE_URL` and `SECRET_KEY`

- Download [react-client-app](https://github.com/MishaDenisenko/react-client-app)
  
### Run on docker

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  
- Go to directory express-api. Than open the terminal and run command `docker compose up -d`

### Run in dev mode

- Go to the directory express-api.
- Open the terminal and run next commands:
``` sh
npm install
npm install -g prisma
prisma generate
npm run dev
```

- Go to the directory react-client-app.
- Open the terminal and run next commands:
``` sh
npm install
npm run dev
```
