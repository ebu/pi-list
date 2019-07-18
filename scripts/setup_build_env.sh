#!/bin/bash
#
# This script installs a build environment.

if ! which apt > /dev/null; then
    echo "This distribution is not Debian-based. Exit."
    exit 1
fi

# get cmake >=3.9
if [ -f /etc/os-release ]; then
    if grep -q stretch /etc/os-release; then
        # at least support our ref dockerized distro, i.e. Debian Stretch where default cmake is v3.7
        echo "deb http://ftp.debian.org/debian stretch-backports main" > /etc/apt/sources.list.d/stretch-backports.list
        CMAKE_INSTALL_OPTIONS="-t stretch-backports --no-install-recommends"
    fi
fi
apt update
apt install -y $CMAKE_INSTALL_OPTIONS cmake

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
apt install -y nodejs npm

echo "Please install FFMPEG v2.8 or newer using your package manager or https://www.ffmpeg.org/download.html"
echo "If you're going to run LIST via Docker, ignore the above message, as FFMPEG is already installed on the Docker image"
