#!/bin/bash
#
# This script creates a build environment in a docker container to be
# used to compile the whole project in a dev or deployment context.
#
# The project directory is mounted as a volume in the container to allow
# both container and native system user to access everything r/w. The
# container user ID is mapped to the native system user ID in order to
# preserve the ownership of the build artefacts.

SCRIPT_DIR="$(dirname $(readlink -f $0))"
TOP_DIR="$(readlink -f $SCRIPT_DIR/..)"
USER=builder
IMAGE=list_builder
DOCKERFILE=$TOP_DIR/release/Dockerfile

usage(){
    echo "Usage: $basename $0 <init|release|dev|bash>
    init        Generate a Dockerfile and the Docker image $IMAGE
    release     Build and deploy LIST project using a container based on $IMAGE
    dev         Build for development, i.e. with debug profile, tests and demos included
    bash        Start bash in the container for dev or troubleshoot."
}

init() {
    if [ ! -f $DOCKERFILE ]
    then
        mkdir -p $TOP_DIR/release/
        echo "Creating $DOCKERFILE"
        cat > $DOCKERFILE << EOF
# This Dockerfile creates a environment to compile the CPP apps, build
# the Node server, and the UI.

FROM gcc:7.2

RUN apt update

RUN adduser --uid $UID --home /home/$USER $USER

ADD ./scripts/ /home/$USER/scripts/
WORKDIR /home/$USER/
RUN ./scripts/setup_dev_env.sh
EOF
    else
        echo ""
        echo "$DOCKERFILE already exits"
    fi

    echo "Creating the Docker image"
    docker build --rm -t $IMAGE -f $DOCKERFILE $TOP_DIR
}

check() {
    if ! $(docker images | grep -q "^$IMAGE")
    then
        init
    fi
}

release() {
    docker run -u $USER -v $TOP_DIR:/home/$USER -it $IMAGE:latest \
        ./scripts/deploy/deploy.sh
}

dev() {
    docker run -u $USER -v $TOP_DIR:/home/$USER -it $IMAGE:latest \
        ./scripts/deploy/build.sh $TOP_DIR/build "-DCMAKE_BUILD_TYPE=Debug -DUSE_PCH=OFF -DBUILD_ALL=ON"
}

run_bash() {
    docker run -u $USER -v $TOP_DIR:/home/$USER -it $IMAGE:latest bash
}

case $1 in
    init)
        init
        ;;
    release)
        check
        release
        ;;
    dev)
        check
        dev
        ;;
    bash)
        check
        run_bash
        ;;
    *)
        usage
        ;;
esac
