#!/bin/bash

# Abort if anything goes wrong
set -eu

this_dir="$(dirname $(readlink -f $0))"
source $this_dir/path.sh || { echo "path.sh is missing"; exit 1; }
cd $TOP_DIR

echo "Bootstrapping..."
yarn install

echo "Building..."
npx lerna run build
(cd "$TOP_DIR/apps/gui-v2" && yarn build:production) || exit 1
(cd "$TOP_DIR/apps/listwebserver" && yarn build) || exit 1

echo "Building GUI..."
cd $TOP_DIR/apps/gui-v2/
yarn run build:production --verbose

echo "Done"

set +eu
