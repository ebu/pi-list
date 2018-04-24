# LIST UI

## How to install it dependencies?

At this point how need one of those package managers installed at your machine:
- `npm`
- `yarn`

To install the needed packages to "compile" this project you must run this command:
`npm install` or `yarn install`

To run this project in _development mode_ you should use the following command (This means hot-reloading in modified JS and CSS files):
- `npm start` or `yarn start` (:warning: __Warning: The generated bundle contains a lot of unneeded code! This is only for development purposes!__)

After that open your browser at http://localhost:8080 and you're ready to use the LIST UI

To generate the code bundle ready for production you should use:
- `npm run production` or `yarn run production` 

- If you want to run the production environment at your local machine you can use the command:
- `npm run start:production` or `tarn run start:production`
(This command will use the NodeJS script code placed in `server` folder in order to start an express server which use gzip to compress JS and CSS files even more!)

## Development task 

- Run Linter (we use ESLint, and the _linter_ rules are places at `.eslintrc.json`)
```bash
npm run lint
```
(or `yarn run lint` if you're using `yarn`)

- Run project unit tests
```bash
npm test
```
(or `yarn test` if you're using `yarn`)

- Run Unit tests using watch mode
```bash
npm run test:watch
```

- If you need to update the snapshot unit tests
```bash
npm run test:update
```