#!/bin/bash
#
# This script creates a build environment in a docker container to be
# used to compile the whole project in a dev or deployment context.
#
# The project directory is mounted as a volume in the container to allow
# both container and native system user to access everything r/w. The
# container user ID is mapped to the native system user ID in order to
# preserve the ownership of the build artefacts.

this_dir="$(dirname $(readlink -f $0))"
source $this_dir/./path.sh || { echo "path.sh is missing"; exit 1; }

USER=builder
IMAGE=list_builder
DOCKERFILE=$RELEASE_DIR/Dockerfile
DOCKER_RUN_CMD="docker run -u $USER -v $TOP_DIR:/home/$USER -it $IMAGE:latest"

usage(){
    echo "Usage: $basename $0 <init|release|dev|test|bash>
    init        Generate a Dockerfile and the Docker image $IMAGE
    release     Build and deploy LIST project using a container based on $IMAGE
    dev         Build for development, i.e. with debug profile, tests and demos included
    test        Build the dev target and runs the test suite
    bash        Start bash in the container for dev or troubleshoot."
}

init() {
    if [ ! -f $DOCKERFILE ]
    then
        mkdir -p $RELEASE_DIR
        echo "Creating $DOCKERFILE"
        cat > $DOCKERFILE << EOF
# This Dockerfile creates a environment to compile the CPP apps, build
# the Node server, and the UI.

FROM gcc:7.2

RUN apt update

RUN adduser --uid $UID --home /home/$USER $USER

ADD ./scripts/ /home/$USER/scripts/
WORKDIR /home/$USER/
RUN ./scripts/setup_build_env.sh
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
    $DOCKER_RUN_CMD ./scripts/deploy/deploy.sh
}

dev() {
    $DOCKER_RUN_CMD ./scripts/deploy/build.sh "-DCMAKE_BUILD_TYPE=Debug -DUSE_PCH=OFF -DBUILD_ALL=ON"
}

test() {
    $DOCKER_RUN_CMD ./scripts/CI/test.sh
}

run_bash() {
    $DOCKER_RUN_CMD bash
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
    test)
        check
        dev
        test
        ;;

    bash)
        check
        run_bash
        ;;
    *)
        usage
        ;;
esac
