#!/bin/bash

# Abort if anything goes wrong
set -eu

this_dir="$(dirname $(readlink -f $0))"
source $this_dir/../path.sh || { echo "path.sh is missing"; exit 1; }

CMAKE_FLAGS=$1
LD_LIBRARY_PATH=/usr/local/lib/

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

set +eu
