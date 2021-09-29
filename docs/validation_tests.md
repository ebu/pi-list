# Validation tests:

Automated validation tests for EBU-LIST based on [ebu-list-sdk](https://github.com/bisect-pt/ebu-list-sdk):

-   basics: authentication, pcap upload, analysis validation, download
-   read-only demo account deployment

## Build

```sh
npx lerna run build --scope="@list/validation-tests"
```

## Tests

```sh
cd packages/tests
yarn run validation-tests -b http://<server_@> -u <user> -p <pwd>
```

# TODO: move this

User read-only

```sh
cd packages/user-read-only
yarn run user-read-only -b http://<server_@> -u <user> -p <pwd>
```

-   u - The username from the demo user that you want to create.

-   p - The password from the demo user that you want to create.

Example:

-   `yarn run read-only-user -b http://localhost -u userdemo -p userdemo`

The default values from "u" and "p" arguments are both "user".
