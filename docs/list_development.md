# Development

## Pre-requisites

- **CMake** >= v3.9
- **Conan** >= v1
- **Docker** >= v15
- **Docker-compose** >= v1.20
- **NodeJS** >= v8
- **C++17 compatible compiler**

We use cmake as the meta build system and require most of our third-party dependencies using conan.
Our *rule of thumb* is to include dependencies using conan when possible. Conan is integrated with CMake,
so it should be transparent within the building process.

In order to run and develop this application on your computer, you need this additional dependencies (you can do all this steps via `./scripts/setup-dev-env.sh` script):
- **FFmpeg** (only if you're going to run LIST locally - ignore this if you're going to run it on Docker)
- **uuid-dev** (only on linux - sudo apt-get install uuid-dev)
- **libpcap-dev** (only on linux)

## Quick-start

If you meet all the pre-requisites, a quick way to start right away is:

```
git clone
git submodule update --init --recursive
```

To run cmake, you can do:

```
mkdir build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build .
```

Or with Visual Studio:

```
mkdir build
cd build
cmake .. -G "Visual Studio 15 Win64"
```

And then open the solution file in the build folder.

## CMake usage and configuration

We use Cmake as the build system for LIST. All the options bellow can be combined together

| Option | Description | Default |
| --- | --- | --- |
| USE_PCH | Use Cotire for Pre-Compiled Headers (Windows only) | ON on Windows, OFF on others |
| BUILD_DEMOS | Build demo applications | OFF |
| BUILD_TESTS | Build unit tests for each library | OFF |
| BUILD_APPS | Build LIST applications | OFF |
| BUILD_ALL | Build everything | OFF |

The folder `config/cmake` contains some cmake files that are used project-wide in order to simplify
CMake usage and extra functionality.

## SDK Structure

The LIST SDK is composed by a set of libraries which can be used separately:

| Library Name | Contains | Link as |
| --- | --- | --- |
| **Core** | Core functionality such as math functions, platform-dependent code, IO abstractions, memory management and media description | ebu_list_core |
| **Net** | Ethernet, IPv4 and UDP handling | ebu_list_net |
| **Pcap** | Reading of PCAP files | ebu_list_pcap |
| **PTP** | PTP decoding | ebu_list_ptp |
| **RTP** | RTP decoding and SDP handling | ebu_list_rtp |
| **ST2110** | Parsing and analysis of ST2110 format | ebu_list_st2110 |

Each project has the following structure:

```
lib/            --> contains library files; nested folders represent namespaces
    include/    --> public .h files
    src/        --> private .h files and .cpp files

unit_tests/     --> test files
CMakeLists.txt  --> definitions for both lib and unit_tests
```

### Use LIST SDK as an external Library

Just use cmake's `add_subdirectory()` and it will work out-of-the-box.

## Contribute

1. Fork it
2. Create your feature branch
3. Develop the new feature/fix
4. Make sure the tests pass locally (and add new ones, if needed)
5. Commit your changes (git commit -am 'Add some awesome feature')
6. Push to the branch
7. Create a new Pull Request
8. Watch CI turn green and wait for review
