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
install -d $RELEASE_DIR/server/data
install -d $RELEASE_DIR/server/data/config
install -d $RELEASE_DIR/server/data/certs
echo "Creating release folders... done"

echo
echo "Copying binaries..."
install -D -m 755 $BUILD_DIR/bin/* $RELEASE_DIR/server/app/bin/
echo "Copying binaries... done"

echo
echo "Copying apps..."
mkdir -p $RELEASE_DIR/server/app/listwebserver


# Dev dependencies have several vulnerabilities which we do not want to ship
# on the final image, so we create a temporary staging directory for node_modules
# and prune development dependencies without affecting the dev environment.
#
# Private @bisect/* packages are not available on the public npm registry so
# in order to avoid resolution failures we also need to copy those manually.
echo "Preparing pruned node_modules for release..."
LISTWS_STAGING_DIR=$(mktemp -d)
cp -R $TOP_DIR/apps/listwebserver/package.json $LISTWS_STAGING_DIR/
if [ -f $TOP_DIR/apps/listwebserver/package-lock.json ]; then
	cp -R $TOP_DIR/apps/listwebserver/package-lock.json $LISTWS_STAGING_DIR/
fi
cp -L -R $TOP_DIR/apps/listwebserver/node_modules $LISTWS_STAGING_DIR/
if [ -d $TOP_DIR/node_modules/@bisect ]; then
	mkdir -p $LISTWS_STAGING_DIR/node_modules
	cp -L -R $TOP_DIR/node_modules/@bisect $LISTWS_STAGING_DIR/node_modules/
fi
npm prune --omit=dev --prefix $LISTWS_STAGING_DIR
echo "Preparing pruned node_modules for release... done"

cp -R $TOP_DIR/apps/listwebserver/dist $RELEASE_DIR/server/app/listwebserver/
cp -R $TOP_DIR/apps/listwebserver/version.yml $RELEASE_DIR/server/app/listwebserver
cp -R $TOP_DIR/apps/listwebserver/package.json $RELEASE_DIR/server/app/listwebserver
if [ -f $LISTWS_STAGING_DIR/package-lock.json ]; then
	cp -R $LISTWS_STAGING_DIR/package-lock.json $RELEASE_DIR/server/app/listwebserver/
fi
cp -L -R $LISTWS_STAGING_DIR/node_modules $RELEASE_DIR/server/app/listwebserver
cp -R $TOP_DIR/apps/gui-v2/packages/react-app/build/* $RELEASE_DIR/server/app/gui
cp -R $DEPLOY_SCRIPT_DIR/artifacts/listwebserver/gen_static_config.sh $RELEASE_DIR/server/app/
cp -R $DEPLOY_SCRIPT_DIR/artifacts/listwebserver/static.config.json $RELEASE_DIR/server/app/listwebserver
cp -R $DEPLOY_SCRIPT_DIR/artifacts/listwebserver/launch.sh $RELEASE_DIR/server/app/listwebserver
cp -R $DEPLOY_SCRIPT_DIR/artifacts/listwebserver/static_server.js $RELEASE_DIR/server/app/listwebserver

rm -rf $LISTWS_STAGING_DIR
echo "Copying apps... done"

echo
echo "Copying artifacts..."
install -m 755 $DEPLOY_SCRIPT_DIR/artifacts/*.sh $RELEASE_DIR/
install -m 755 $DEPLOY_SCRIPT_DIR/artifacts/docker-compose.yml $RELEASE_DIR/
install -m 644 $DEPLOY_SCRIPT_DIR/artifacts/listwebserver/Dockerfile $RELEASE_DIR/server/
install -m 644 $DEPLOY_SCRIPT_DIR/artifacts/listwebserver/config.yml $RELEASE_DIR/server/app/listwebserver
# nginx
install -m 644 $DEPLOY_SCRIPT_DIR/artifacts/data/config/nginx.conf $RELEASE_DIR/server/data/config/
install -m 644 $DEPLOY_SCRIPT_DIR/artifacts/data/config/mime.types $RELEASE_DIR/server/data/config/
install -m 644 $DEPLOY_SCRIPT_DIR/artifacts/data/certs/listreverseproxy.crt $RELEASE_DIR/server/data/certs/
install -m 644 $DEPLOY_SCRIPT_DIR/artifacts/data/certs/listreverseproxy.key $RELEASE_DIR/server/data/certs/
echo "Copying artifacts... done"

echo
echo "Deploy is ready in $RELEASE_DIR."

set +eu
