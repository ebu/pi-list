# Development

## Sources structure

```
git clone https://github.com/ebu/pi-list
cd pi-list/
git submodule update --init --recursive
```

LIST is mostly composed of:

- C++ core stream analyzer
- nodejs backend
- reactjs web UI
- set of nodejs side apps

## Pre-requisites

- **CMake** >= v3.19
- **Conan** >= v1.33
- **Ninja** >= v1.10
- **Docker** >= v15
- **Docker-compose** >= v1.20
- **NodeJS** >= v12 + npm packages: lerna & yarn
- **C++17 compatible compiler**

We use CMake as the meta build system and require most of our third-party dependencies using conan.
Our *rule of thumb* is to include dependencies using conan when possible. Conan is integrated with CMake, so it should be transparent within the build process.

In order to run and develop this application on your computer, you need this additional dependencies (you can do all this steps via `./scripts/setup-dev-env.sh` script):
- **FFmpeg** (only if you're going to run LIST locally - ignore this if you're going to run it on Docker)
- **uuid-dev** (only on linux - sudo apt-get install uuid-dev)
- **libpcap-dev** (only on linux)

If you run a Debian-based distribution, you can install everythin with:

```
./scripts/setup-build-env.sh
```

## Core stream analyzer (c++)

When you meet all the pre-requisites, a quick way to start right away is:

```
./scripts/build_cpp.sh
ls ./build/bin/
```

### CMake usage and configuration

All the options below can be combined together

| Option      | Description                                        | Default                      |
| ----------- | -------------------------------------------------- | ---------------------------- |
| USE_PCH     | Use Cotire for Pre-Compiled Headers (Windows only) | ON on Windows, OFF on others |
| BUILD_DEMOS | Build demo applications                            | OFF                          |
| BUILD_TESTS | Build unit tests for each library                  | OFF                          |
| BUILD_APPS  | Build LIST applications                            | OFF                          |
| BUILD_ALL   | Build everything                                   | OFF                          |

The folder `config/cmake` contains some cmake files that are used project-wide in order to simplify
CMake usage and extra functionality.

### Library structure

The stream analyzer uses a set of libraries which can be used separately:

| Library Name | Contains                                                                                                                     | Link as         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Core**     | Core functionality such as math functions, platform-dependent code, IO abstractions, memory management and media description | ebu_list_core   |
| **Net**      | Ethernet, IPv4 and UDP handling                                                                                              | ebu_list_net    |
| **Pcap**     | Reading of PCAP files                                                                                                        | ebu_list_pcap   |
| **PTP**      | PTP decoding                                                                                                                 | ebu_list_ptp    |
| **RTP**      | RTP decoding and SDP handling                                                                                                | ebu_list_rtp    |
| **ST2110**   | Parsing and analysis of ST2110 format                                                                                        | ebu_list_st2110 |

Each project has the following structure:

```
lib/            --> contains library files; nested folders represent namespaces
    include/    --> public .h files
    src/        --> private .h files and .cpp files

unit_tests/     --> test files
CMakeLists.txt  --> definitions for both lib and unit_tests
```

To use as an external library, just use cmake's `add_subdirectory()` and it will work out-of-the-box.

## Build node packages:

Packages are listed in `lerna.json` and mostly includes:

- backend server
- reacjs GUI
- third-party dependencies
- side apps

```
./scripts/build_node.sh
```

You can still compile an individual package.

```
npx lerna run build --scope="@list/validation-tests"
```

## Contribute

1. Fork it
2. Create your feature branch
3. Develop the new feature/fix
4. Make sure the tests pass locally (and add new ones, if needed)
5. Commit your changes (git commit -am 'Add some awesome feature')
6. Push to the branch
7. Create a new Pull Request
8. Watch CI turn green and wait for review

### Contribute to translations

All the labels of the UI are generated from [a Google Sheet](https://docs.google.com/spreadsheets/d/1yqL3CKmUu_M1AWCtHEzG5hp-8B1X-5_qxcgDn4AbFYo/edit) for every supported language.

The translations will be generated during the deploy process either Linux host
or Docker builds, to achieve this a token must be generated first.
This token can be kept locally and can be reused.

```
node apps/gui/data/translationsGenerator.js -t
```
