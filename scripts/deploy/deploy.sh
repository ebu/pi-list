#!/bin/bash

# Installs Deploy dependencies
./install_dependencies.sh

# Builds CPP code
./build.sh

cd ../..

echo
echo "Deleting old release dir (if present)..."
rm -rf release
echo "Deleting old release dir (if present)... done"

echo
echo "Creating release folders..."
mkdir -p release
mkdir -p release/bin
mkdir -p release/lib
echo "Creating release folders... done"

echo
echo "Copying binaries..."
cp build/bin/stream_pre_processor build/bin/static_generator build/bin/st2110_extractor release/bin/
cp build/lib/*.so.* release/lib/
echo "Copying binaries... done"

echo
echo "Copying apps..."
cp -rf apps/listwebserver/ release/
cp -rf apps/gui/dist/ release/gui/
echo "Copying apps... done"

echo
echo "Copying artifacts..."
cp -r scripts/deploy/artifacts/* release/
echo "Copying scripts... done"
echo
echo "Deploy ready! You can find a folder named release on the top-level directory of this repository"