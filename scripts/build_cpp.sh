#!/bin/bash

# Abort if anything goes wrong
set -e

this_dir="$(dirname $(readlink -f $0))"
source $this_dir/path.sh || { echo "path.sh is missing"; exit 1; }

if [ -z "$1" ]; then
    echo "Usage:
    $0 <dev|release>"
    exit 1
fi

echo
echo "Compiling C++ Code..."
mkdir -p $BUILD_DIR
cd $BUILD_DIR

if [ "$1" = release ]; then
    CMAKE_FLAGS="-DCMAKE_BUILD_TYPE=Release -DUSE_PCH=OFF -DBUILD_APPS=ON"
    elif [ "$1" = dev ]; then
    CMAKE_FLAGS="-DCMAKE_BUILD_TYPE=Debug -DUSE_PCH=OFF -DBUILD_ALL=ON"
else
    CMAKE_FLAGS="" # can be "-G 'Visual Studio 15 Win64'"
fi
echo "Using cmake flags: $CMAKE_FLAGS"

LD_LIBRARY_PATH=/usr/local/lib/
cmake .. -G Ninja $CMAKE_FLAGS
ninja -j 16
echo "Compiling CPP Code... done"

set +e
