#!/bin/bash
#
# This script creates a build environment in a docker container to be
# used to compile the whole project.
# The project directory is mounted as a volume in the container to allow
# both container and native system user to access everything r/w. The
# container user ID is mapped to the native system user ID in order to
# preserve the ownership of the build artefacts.

SCRIPT_DIR="$(dirname $(readlink -f $0))"
TOP_DIR="$(readlink -f $SCRIPT_DIR/..)"
USER=builder
IMAGE=list_dev_env
DOCKERFILE=$TOP_DIR/release/Dockerfile

usage(){
    echo "Usage: $basename $0 <init|build|bash>
    init   Generate a Dockerfile and the Docker image $IMAGE
    build  Build LIST project using a container based on $IMAGE
    bash   Start bash in the container for dev or troubleshoot."
}

init() {
    if [ ! -f $DOCKERFILE ]
    then
        mkdir -p $TOP_DIR/release/
        echo "Creating $DOCKERFILE"
        cat > $DOCKERFILE << EOF
# This is the "builder" Dockerfile

FROM gcc:7.2

RUN apt update

RUN adduser --uid $UID --home /home/$USER $USER

ADD ./scripts/ /home/$USER/scripts/
WORKDIR /home/$USER/
RUN ./scripts/setup-dev-env.sh
EOF
    else
        echo ""
        echo "$DOCKERFILE already exits"
    fi

    echo "Creating the Docker image"
    docker build --rm -t $IMAGE -f $DOCKERFILE $TOP_DIR
}

build() {
    docker run -u $USER -v $TOP_DIR:/home/$USER -it $IMAGE:latest ./scripts/deploy/deploy.sh
}

run_bash() {
    docker run -u $USER -v $TOP_DIR:/home/$USER -it $IMAGE:latest bash
}

case $1 in
    init)
        init
        ;;
    build)
        build
        ;;
    bash)
        run_bash
        ;;
    *)
        usage
        ;;
esac
