#!/bin/bash
#
# This script installs a build environment.

if ! which apt > /dev/null; then
    echo "This distribution is not Debian-based. Exit."
    exit 1
fi

# get cmake >=3.9
apt update
apt install -y libarchive13
apt install -y cmake

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
curl -sL https://deb.nodesource.com/setup_8.x | bash -
apt install -y nodejs
apt install -y npm

echo "Please install FFMPEG v2.8 or newer using your package manager or https://www.ffmpeg.org/download.html"
echo "If you're going to run LIST via Docker, ignore the above message, as FFMPEG is already installed on the Docker image"
