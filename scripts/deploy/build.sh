#!/bin/bash

SCRIPT_DIR="$(dirname $(readlink -f $0))"
TOP_DIR="$SCRIPT_DIR/../.."
BUILD_DIR="$TOP_DIR/build"

mkdir -p $BUILD_DIR
cd $BUILD_DIR

echo
echo "Compiling CPP Code..."
cmake .. -DCMAKE_BUILD_TYPE=Release -DUSE_PCH=OFF -DBUILD_APPS=ON
make -j4
echo "Compiling CPP Code... done"

echo
echo "Compiling GUI..."
cd $TOP_DIR/apps/gui/
npm install && npm run production
echo "Compiling GUI... done"
