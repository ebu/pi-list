# How to compile LIST

## Get the sources

The project is made of a master repo plus third-party components.

```
git clone https://github.com/ebu/pi-list.git
cd pi-list/
git submodule update --init --recursive
```

## Requirement

**Ubuntu 20.04**

Otherwise go through the [development guide](./development_guide.md) to
get detailed dependencies and build tools.

## Compile

Install build env:

```
./scripts/setup-build-env.sh
```

Build the dependencies and the project:

```
./scripts/deploy/deploy.sh
```

## Output

A new folder `release` will appear on the top-level directory of this repository. It contains the artefact to be installed on the LIST server and all docker-compose files to instantiate all the micro-services.

If necessary, [make you server visible from another host.](./how-to-install-on-local-docker.md#exposing-list-to-the-network)

```
cd release
./start.sh
```
