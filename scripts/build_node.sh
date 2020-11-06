#!/bin/bash

# Abort if anything goes wrong
set -eu

this_dir="$(dirname $(readlink -f $0))"
source $this_dir/path.sh || { echo "path.sh is missing"; exit 1; }

echo "Bootstrapping lerna..."
cd $TOP_DIR
npm i
npx lerna bootstrap
npx lerna run build
npx lerna run production

echo "Done"

set +eu
