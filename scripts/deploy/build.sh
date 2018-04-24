#!/bin/bash

cd ../../
mkdir -p build
cd build

echo
echo "Compiling CPP Code..."
cmake .. -DCMAKE_BUILD_TYPE=Release -DUSE_PCH=OFF -DBUILD_APPS=ON
make -j4
echo "Compiling CPP Code... done"

cd ../
cd apps/

echo
echo "Compiling GUI..."
cd gui/
npm install && npm run production
echo "Compiling GUI... done"

cd ../

echo
echo "Compiling List Web Server..."
cd listwebserver/
# npm install && pkg -t node8-linux -o listwebserver server.js
echo "Compiling List Web Server... done"
