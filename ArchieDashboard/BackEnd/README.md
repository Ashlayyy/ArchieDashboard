# DataMetrics API

### Mappenstructuur:

- `/src/config`
  Config file for RateLimit, Slowdown and some database settings
- `/src/database`
  Files to connect to sql and mongoose database for the API
- `/src/helpers`
  - `/mappers`
    Here I have placed all the functions for mapping of data etc
  - Other random things that don't really belong in a folder
- `/src/interfaces`
  Interfaces for logger and evt other stuff
- `/src/middelwares`
  Middlewares for the express server
- `/src/module/`
  - `/backupmetrics`
    - `/controllers`
      Folder for the backupmetrics controllers, this uses the service defined in `/services` to get data out of database and send it back to the user
    - `/interfaces`
      Here you can find all the interfaces for this module
    - `/models`
      Here you can find the model for BackupMetrics
    - `/services`
      Services for this module to get data actually out of the database
    - `/types`
      Types for this whole module
  - `/predicting`
    - `/controllers`
      Folder for the predicting controllers, this used a service defined in `/services` to get predicting data
    - `/interfaces`
      interfaces for this module
    - `/services`
      Defines services for this module to be able to be used in `/controllers`
  - `/settings`
    Still a WIP -> Same folder structuur as above
- `/src/routes`
  Here I have put all the routes I use, in different files. The `index.ts` file is used in the server to start everything up
- `/src/shared/container`
  Here I define the tsyringe dependencies I use for the DI principle
- `/src/types`
  Here I have all the types used in more then one part of the application
- `app.ts`
  Here I create the express app
- `server.ts`
  Here I use `app.ts` to actually start up the server

### npm run commands

- ##### Cleaning
  - `npm run clean`
    - This commands removes the `./dist`, `./coverage` and `./node_modules` directorys
  - `npm run clean-install`
    - removes `./package-lock.json` and `./node_modules` and then installs everything again with `npm install`
- ##### Linting / Checking
  - `npm run lint`
    - Uses `ESLint` to lint the antire application
  - `npm run lint:fix`
    - Uses `ESLint` to lint the entire application, and applies the things `Eslint` says
  - `npm run prettier:check`
    - Uses `prettier` to check the entire application for formatting faults
  - `npm run prettier:write`
    - Uses `prettier` to write the entire application as formatting wants it
  - `npm run code:check`
    - Command used `Prettier` and `ESLint` to check code for mistakes etc, just checking with this one (uses `npm run lint` and `npm run prettier:check` concurrently)
  - `npm run code:clean`
    - Command used `Prettier` and `ESLint` to check code for mistakes, then rewrite the files to fit the styling profile you selected (uses `npm run lint:fix` and `npm run prettier:write` concurrently)
- ##### Starting
  - `npm run start`
    - Usefull to start in production mode, also sets NODE_ENV to production. You would first need to build the API before this command
  - `npm run dev`
    - Used to start the API in development mode, also sets NODE_ENV to development
  - `npm run debug`
    - Starts the app up in development mode, but also uses the `Debug` package to actually debug. Multiple packages in this application uses this package to log stuff, so you can see really well what is happening.
- ##### Building
  - `npm run build`
    - Used to build the whole API in the `./dist` directory
  - `npm run build-start`
    - runs `npm run build` and then starts the server by using `npm run start` for you so you dont have to run the commands yourself
- ##### Testing
  - `npm run test`
    - No test written yet, but for when you do write some tests you can run this command to run tests with `Jest`
- ##### Audit
  - `npm run audit`
    - Use `better-npm-audit` to audit every package you use
