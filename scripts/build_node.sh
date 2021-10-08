#!/bin/bash

# Abort if anything goes wrong
set -eu

this_dir="$(dirname $(readlink -f $0))"
source $this_dir/path.sh || { echo "path.sh is missing"; exit 1; }
cd $TOP_DIR

echo "Bootstrapping..."
yarn install
npx lerna bootstrap

echo "Building..."
npx lerna run build
# to build single package: npx lerna run build --scope="@list/validation-tests"

echo "Building GUI..."
cd $TOP_DIR/apps/gui-v2/
yarn run build:production

echo "Done"

set +eu
