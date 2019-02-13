#!/bin/bash

# Find absolute path of project directory
# and set all other directories from it.

TOP_DIR=$(pwd)
while [ ! -e .git -a ! $(pwd) = "/" ]; do
    cd ..
done
TOP_DIR=$(pwd)
if [ $TOP_DIR = "/" ]; then
    echo "Abort. Please run the command from inside the project directory."
    exit 1
fi

RELEASE_DIR=$TOP_DIR/release
BUILD_DIR=$TOP_DIR/build
SCRIPT_DIR=$TOP_DIR/scripts
DEPLOY_SCRIPT_DIR=$TOP_DIR/scripts/deploy

set | grep "_DIR="
