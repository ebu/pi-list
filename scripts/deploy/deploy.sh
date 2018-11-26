#!/bin/bash

# Abort if anything goes wrong
set -eu

# Installs Deploy dependencies
SCRIPT_DIR="$(dirname $(readlink -f $0))"
TOP_DIR="$(readlink -f $SCRIPT_DIR/../..)"
RELEASE_DIR="$TOP_DIR/release"

# conan custom config
conan config install https://github.com/bisect-pt/conan_config.git

# Builds CPP code
source $SCRIPT_DIR/build.sh "-DCMAKE_BUILD_TYPE=Release -DUSE_PCH=OFF -DBUILD_APPS=ON"

# Install the release directory
echo
echo "Deleting old release dir (if present)..."
rm -rf $RELEASE_DIR
echo "Deleting old release dir (if present)... done"

echo
echo "Creating release folders..."
install -d $RELEASE_DIR/server/app/bin
install -d $RELEASE_DIR/server/app/gui
install -d $RELEASE_DIR/server/app/listwebserver
install -d $RELEASE_DIR/server/lib
echo "Creating release folders... done"

echo
echo "Copying binaries..."
install -D -m 755 $BUILD_DIR/bin/* $RELEASE_DIR/server/app/bin/
install -D -m 755 $BUILD_DIR/lib/*.so.* $RELEASE_DIR/server/lib/
echo "Copying binaries... done"

echo
echo "Copying apps..."
cp -R $TOP_DIR/apps/listwebserver/* $RELEASE_DIR/server/app/listwebserver
cp -R $TOP_DIR/apps/gui/dist/* $RELEASE_DIR/server/app/gui
echo "Copying apps... done"

echo
echo "Copying artifacts..."
install -m 755 $SCRIPT_DIR/artifacts/*.sh $RELEASE_DIR/
install -m 755 $SCRIPT_DIR/artifacts/docker-compose.yml $RELEASE_DIR/
install -m 644 $SCRIPT_DIR/artifacts/listwebserver/Dockerfile $RELEASE_DIR/server/
install -m 644 $SCRIPT_DIR/artifacts/listwebserver/config.yml $RELEASE_DIR/server/app/listwebserver
echo "Copying artifacts... done"

echo
echo "Deploy is ready in $RELEASE_DIR.
If you run the server in a container OR if you want to access this server from another machine, you should replace 'localhost' in $RELEASE_DIR/server/app/listwebserver/config.yml with appropriate address."

set +eu
