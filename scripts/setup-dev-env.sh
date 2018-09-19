#!/bin/bash

apt install -y uuid-dev libpcap-dev

conan config install https://github.com/bisect-pt/conan_config.git

if which node > /dev/null
then
    echo "node is installed, skipping..."
else
    apt install -y curl
    curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
    bash nodesource_setup.sh
    apt install -y nodejs npm
fi

echo "Please install FFMPEG v2.8 or newer using your package manager or https://www.ffmpeg.org/download.html"
echo "If you're going to run LIST via Docker, ignore the above message, as FFMPEG it's already installed on Docker image"
