#!/bin/bash

BUILD_DIR=$1
CMAKE_FLAGS=$2
SCRIPT_DIR="$(dirname $(readlink -f $0))"
TOP_DIR="$(readlink -f $SCRIPT_DIR/../..)"
LD_LIBRARY_PATH=/usr/local/lib/

if [ -z $BUILD_DIR ]; then
    BUILD_DIR="$TOP_DIR/build"
    echo "Using default build directory: $BUILD_DIR"
fi
mkdir -p $BUILD_DIR
cd $BUILD_DIR

echo
echo "Compiling CPP Code..."
if [ -z $CMAKE_FLAGS ]; then
    echo "Using default cmake flags."
fi
cmake .. $CMAKE_FLAGS
make -j4
echo "Compiling CPP Code... done"

echo
echo "Compiling GUI..."
cd $TOP_DIR/apps/gui/
npm install && npm run production
echo "Compiling GUI... done"
