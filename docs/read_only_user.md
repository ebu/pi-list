# User read-only

-   read-only demo account deployment

## Build

```sh
npx lerna run build --scope="@list/user-read-only-script"
```

```sh
cd packages/user-read-only
yarn run user-read-only -b http://<server_@> -u <user> -p <pwd>
```

-   u - The username from the demo user that you want to create.

-   p - The password from the demo user that you want to create.

Example:

-   `yarn run read-only-user -b http://localhost -u userdemo -p userdemo`

The default values from "u" and "p" arguments are both "user".
