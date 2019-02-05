# Live IP Software Toolkit to assist EBU members in the implementation of IP based facilities

![overview](docs/overview.gif)

LIST is composed by:
- a set of libraries that handle the ST2110 standards suite;
- a browser-based application that analyzes previously captured network packets as pcap files.

## Main Features

| | |
:-------------------------|:-------------------------:
Quickly understand if your streams are ST2110 compliant, without configuration! | ![](docs/pcap_overview.png)
See the capture's content | ![](docs/stream_overview.png)
PTP Analysis | ![](docs/ptp_analysis.png)
Drill drown on each stream and understand what's going on | ![](docs/stream_drilldown.png)


## Dematerialized version

We deployed an [online version](http://list.ebu.io/) that you can start using right away.

## Run - Quick-start

The easiest way to quickly use LIST application is via Docker. Choose one of the below's options that suits you the best.

### Using [Docker Hub's Image](https://hub.docker.com/r/ebutech/pi-list/)

You'll need:

- **Docker** >= v15
- **Docker-compose** >= v1.20

```
version: "3"
services:
  influxdb:
    image: influxdb:1.4.2
    volumes:
      - influxdb:/var/lib/influxdb

  mongo:
    image: mongo:latest
    volumes:
      - mongo:/data/db

  list_server:
    image: ebutech/pi-list:v1.3 #replace by any version available @ Docker Hub
    ports:
      - "8080:8080"
      - "3030:3030"
    links:
      - influxdb
      - mongo
    volumes:
      - listserver:/home/

volumes:
  mongo:
  listserver:
  influxdb:
```

You're good to go: `http://localhost:8080`

## Compiling

You can either build locally on your host with an appropriate environment
or in a Docker container that produces a reference environment.

### Dependencies:

- **CMake** >= v3.9
- **Conan** >= v1
- **C++17** compiler
- **NodeJS** >= v8

### The sources

The project is made of a master repo plus third-party components.

```
git clone https://github.com/ebu/pi-list.git
git submodule update --init --recursive
```

### Linux (Debian) host build

Additional requirements:

- **uuid-dev**
- **libpcap-dev**

Fetch the project, build the dependencies and the project:

```
./scripts/setup-dev-env.sh
./scripts/deploy/deploy.sh
```

### Docker build

**Docker** >= v15 is needed.

From the top directory, use the docker wrapper script:

```
./scripts/docker_build_wrapper.sh
Usage:  ./scripts/docker_build_wrapper.sh <init|build|bash>
    init   Generate a Dockerfile and the Docker image list_dev_env
    build  Build LIST project using a container based on list_dev_env
    bash   Start bash in the conatiner for dev or troubleshoot.
```

### Output

A new folder `release` will appear on the top-level directory of this repository. It contains the artefact to be installed on the LIST server and all docker-compose files to instanciate all the micros-services.

```
cd release
./start.sh
```

## Development
### Pre-requisites

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


### Quick-start

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

### CMake usage and configuration

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

## Additional information

* [Cfull and Vrx analysis](./docs/cfull_and_vrx_analysis.md)
* [Audio timing analysis](./docs/audio_timing_analysis.md)

## License

See [LICENSE](LICENSE.md) for more information.
