#!/bin/bash
# Install the release directory

# Abort if anything goes wrong
set -eu

this_dir="$(dirname $(readlink -f $0))"
source $this_dir/../path.sh || { echo "path.sh is missing"; exit 1; }

$this_dir/../build_cpp.sh release
$this_dir/../build_node.sh

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
install -d $RELEASE_DIR/data
install -d $RELEASE_DIR/data/config
install -d $RELEASE_DIR/data/certs
echo "Creating release folders... done"

echo
echo "Copying binaries..."
install -D -m 755 $BUILD_DIR/bin/* $RELEASE_DIR/server/app/bin/
install -D -m 755 $BUILD_DIR/lib/*.so.* $RELEASE_DIR/server/lib/
echo "Copying binaries... done"

echo
echo "Copying apps..."
cp -R $TOP_DIR/apps/listwebserver/* $RELEASE_DIR/server/app/listwebserver
cp -R $TOP_DIR/js $RELEASE_DIR/server/js
cp -R $TOP_DIR/apps/gui/dist/* $RELEASE_DIR/server/app/gui
cp -R $DEPLOY_SCRIPT_DIR/artifacts/listwebserver/sedstaticconfig.sh $RELEASE_DIR/server/app/
cp -R $DEPLOY_SCRIPT_DIR/artifacts/listwebserver/static.config.json $RELEASE_DIR/server/app/gui
cp -R $DEPLOY_SCRIPT_DIR/artifacts/listwebserver/static.config.json $RELEASE_DIR/server/app/listwebserver
echo "Copying apps... done"

echo
echo "Copying artifacts..."
install -m 755 $DEPLOY_SCRIPT_DIR/artifacts/*.sh $RELEASE_DIR/
install -m 755 $DEPLOY_SCRIPT_DIR/artifacts/docker-compose.yml $RELEASE_DIR/
install -m 644 $DEPLOY_SCRIPT_DIR/artifacts/listwebserver/Dockerfile $RELEASE_DIR/server/
install -m 644 $DEPLOY_SCRIPT_DIR/artifacts/listwebserver/config.yml $RELEASE_DIR/server/app/listwebserver
# nginx
install -m 644 $DEPLOY_SCRIPT_DIR/artifacts/data/config/nginx.conf $RELEASE_DIR/data/config/
install -m 644 $DEPLOY_SCRIPT_DIR/artifacts/data/config/mime.types $RELEASE_DIR/data/config/
install -m 644 $DEPLOY_SCRIPT_DIR/artifacts/data/certs/nginx-selfsigned.crt $RELEASE_DIR/data/certs/
install -m 644 $DEPLOY_SCRIPT_DIR/artifacts/data/certs/nginx-selfsigned.key $RELEASE_DIR/data/certs/
echo "Copying artifacts... done"

echo
echo "Deploy is ready in $RELEASE_DIR."

set +eu
