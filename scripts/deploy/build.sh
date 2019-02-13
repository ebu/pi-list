#!/bin/bash

CMAKE_FLAGS=$1

SCRIPT_DIR="$(dirname $(readlink -f $0))"
TOP_DIR="$(readlink -f $SCRIPT_DIR/../..)"
BUILD_DIR="$TOP_DIR/build"

LD_LIBRARY_PATH=/usr/local/lib/

mkdir -p $BUILD_DIR
cd $BUILD_DIR

echo
echo "Compiling CPP Code..."
cmake .. $CMAKE_FLAGS
make -j4
echo "Compiling CPP Code... done"

echo
echo "Compiling GUI..."
cd $TOP_DIR/apps/gui/
npm install && npm run production
echo "Compiling GUI... done"
