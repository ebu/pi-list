#!/bin/bash

sudo apt-get install -y uuid-dev

conan remote add bincrafters https://api.bintray.com/conan/bincrafters/public-conan
conan remote add bisect https://api.bintray.com/conan/bisect/bisect

echo "Please install FFMPEG v2.8 or newer using your package manager or https://www.ffmpeg.org/download.html"

