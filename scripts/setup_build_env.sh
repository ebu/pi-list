#!/bin/bash
#
# This script installs a build environment.

if ! which apt > /dev/null; then
    echo "This distribution is not Debian-based. Exit."
    exit 1
fi

# get cmake >=3.9
apt-get update
apt-get install -y libarchive13
apt-get install -y cmake

# utilities
apt install -y \
curl \
libpcap-dev \
libssl-dev \
python-pip \
uuid-dev

# Conan is a python package used to build CPP dependencies
pip install conan

# custom node version
curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs

npm i -g lerna
npm i -g yarn

echo "Please install FFMPEG v2.8 or newer using your package manager or https://www.ffmpeg.org/download.html"
echo "If you're going to run LIST via Docker, ignore the above message, as FFMPEG is already installed on the Docker image"
