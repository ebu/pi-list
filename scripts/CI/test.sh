#!/bin/bash

set -eu

this_dir="$(dirname $(readlink -f $0))"
source $this_dir/../path.sh || { echo "path.sh is missing"; exit 1; }

cd $BUILD_DIR
ctest

set +eu
