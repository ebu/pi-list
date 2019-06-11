# How to compile LIST

You can either build locally on your host with an appropriate environment
or in a Docker container that produces a reference environment.

## Dependencies:

- **CMake** >= v3.9
- **Conan** >= v1
- **Docker** >= v15
- **Docker-compose** >= v1.20
- **NodeJS** >= v8
- **C++17 compatible compiler**

## The sources

The project is made of a master repo plus third-party components.

```
git clone https://github.com/ebu/pi-list.git
cd pi-list/
git submodule update --init --recursive
```

## Linux (Debian) host build

Build the dependencies and the project:

```
./scripts/setup-build-env.sh
./scripts/deploy/deploy.sh
```

## Docker build

**Docker** >= v15 is needed if you want your build environment independant from your working env.

Use the docker wrapper script:

```
./scripts/docker_build_wrapper.sh
 Usage:  ./scripts/docker_build_wrapper.sh <init|release|dev|test|bash>
    init        Generate a Dockerfile and the Docker image list_builder
    release     Build and deploy LIST project using a container based on list_builder
    dev         Build for development, i.e. with debug profile, tests and demos included
    test        Build the dev target and runs the test suite
    bash        Start bash in the container for dev or troubleshoot.
```

## Output

A new folder `release` will appear on the top-level directory of this repository. It contains the artefact to be installed on the LIST server and all docker-compose files to instantiate all the micro-services.

If necessary, [make you server visible from another host.](./local_docker.md#exposing-list-to-the-network)

```
cd release
./start.sh
```
