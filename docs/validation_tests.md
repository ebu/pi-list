# Validation tests:

Automated validation tests for EBU-LIST based on [ebu-list-sdk](https://github.com/bisect-pt/ebu-list-sdk):

- basics: authentication, pcap upload, analysis validation, download
- advanced: audio-jitter against profiles

## Build

```sh
npx lerna run build --scope="@list/validation-tests"
```

## Tests

```sh
cd packages/tests
yarn run validation-tests-basics -b http://<server_@> -u <user> -p <pwd>
yarn run validation-tests-advanced -b http://<server_@> -u <user> -p <pwd>
```
