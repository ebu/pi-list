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
./scripts/setup_build_env.sh
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

## Manual build for development

Create branches from the "integration" branch

The string \<project root\> is the location of the EBU-LIST directory.

```
> git clone ...
> git submodule update --init --recursive

> mkdir cmake-build-release
> cd cmake-build-release
> cmake .. -DCMAKE_BUILD_TYPE=Release -DBUILD_ALL=1 -G Ninja
> cmake --build . -- -j 8

> cd <project root>
> cd apps/listwebserver
> mkdir ~/.list
> cp config.yml ~/.list
> edit ~/.list/config.yml and change the following lines:

folder: /home/<your user name>/.list/data
cpp: <project root>/cmake-build-debug/bin
```

-   Open 4 terminals

1:

```
> cd <project root>
> cd apps/external
> docker-compose up
```

2:

```
> cd <project root>
> cd apps/gui-v2
> yarn run start
```

3:

```
> cd <project root>
> cd apps/listwebserver
> npm run dev -- ~/.list/config.yml
```

4:

```
> cd <project root>
> cd cmake-build-release
> ./bin/stream_pre_processor
```
