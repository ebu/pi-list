#!/bin/bash

# Abort if anything goes wrong
set -eu

this_dir="$(dirname $(readlink -f $0))"
source $this_dir/path.sh || { echo "path.sh is missing"; exit 1; }

echo "Bootstrapping lerna..."
cd $TOP_DIR
yarn install
npx lerna bootstrap
npx lerna run build
cd $TOP_DIR/apps/gui-v2/
yarn run build:production

echo "Done"

set +eu
