# Validation tests:

Pcaps upload duration time tests for EBU-LIST based on [ebu-list-sdk](https://github.com/bisect-pt/ebu-list-sdk):

## Build

```sh
npx lerna run build --scope="@list/validation-tests"
```

## Tests

from the root_directory:

```sh
cd js/tests
EBU_LIST_PCAPS=<path to pcap files> yarn run time-tests -b http://<server_@> -u <user> -p <pwd>
```

It is necessary to define the path where the pcap files are, without it the tests will not run.
