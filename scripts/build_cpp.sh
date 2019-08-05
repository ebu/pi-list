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
echo "Setup conan config..."
conan config install https://github.com/bisect-pt/conan_config.git
echo "Setup conan config... Done"

echo
echo "Compiling C++ Code..."
mkdir -p $BUILD_DIR
cd $BUILD_DIR

if [ "$1" = release ]; then
    CMAKE_FLAGS="-DCMAKE_BUILD_TYPE=Release -DUSE_PCH=OFF -DBUILD_APPS=ON"
elif [ "$1" = dev ]; then
    CMAKE_FLAGS="-DCMAKE_BUILD_TYPE=Debug -DUSE_PCH=OFF -DBUILD_ALL=ON"
else
    CMAKE_FLAGS=""
fi
echo "Using cmake flags: $CMAKE_FLAGS"

LD_LIBRARY_PATH=/usr/local/lib/
cmake .. $CMAKE_FLAGS
make -j16
echo "Compiling CPP Code... done"

set +e
