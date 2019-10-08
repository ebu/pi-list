#!/bin/bash

# Abort if anything goes wrong
set -eu

this_dir="$(dirname $(readlink -f $0))"
source $this_dir/path.sh || { echo "path.sh is missing"; exit 1; }

echo "Compiling common js..."
cd $TOP_DIR/js/common_server/
npm install
echo "Compiling common js... done"

echo
echo "Compiling LIST server..."
cd $TOP_DIR/apps/listwebserver/
npm install
echo "Compiling LIST server... done"

echo
echo "Compiling capture probe..."
cd $TOP_DIR/apps/capture_probe/
npm install
echo "Compiling capture probe... done"

echo
echo "Generating translation..."
cd $TOP_DIR/apps/gui/data/
node ./translationsGenerator.js
echo "Generating translation... done"

echo
echo "Compiling GUI..."
cd $TOP_DIR/apps/gui/
npm install && npm run production
echo "Compiling GUI... done"

set +eu
