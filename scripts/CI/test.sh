#!/bin/bash

set -eu

SCRIPT_DIR="$(dirname $(readlink -f $0))"
TOP_DIR="$(readlink -f $SCRIPT_DIR/../..)"
BUILD_DIR="$TOP_DIR/build"

cd $BUILD_DIR
ctest

