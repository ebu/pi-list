#!/bin/bash

# Abort if anything goes wrong
set -eu

this_dir="$(dirname $(readlink -f $0))"
source $this_dir/path.sh || { echo "path.sh is missing"; exit 1; }

echo "Bootstrapping lerna..."
cd $TOP_DIR
lerna bootstrap

echo "Compiling..."
lerna run build
echo "Running production build..."
lerna run production
echo "Done"

set +eu
