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

EBU_LIST_PCAPS is a environment variable that needs to be defined, it is the path where the pcap files are, without it the tests will not run.

The test results will be written on a file named duration_time_tests.txt located in the directory assigned by the env variable 'EBU_LIST_PCAPS'.
