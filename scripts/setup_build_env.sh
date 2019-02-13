#!/bin/bash
#
# This script installs a build/dev environment on a Debian host.

# get cmake 3.9
echo "deb http://ftp.debian.org/debian stretch-backports main" > /etc/apt/sources.list.d/stretch-backports.list
apt update
apt -t stretch-backports install -y --no-install-recommends cmake

# utilities
apt install -y \
    curl \
    libpcap-dev \
    libssl-dev \
    python-pip \
    rsync \
    uuid-dev

# Conan is a python package used to build CPP dependencies
pip install conan

# custom node version
curl -sL https://deb.nodesource.com/setup_8.x | bash -
apt install -y nodejs npm

echo "Please install FFMPEG v2.8 or newer using your package manager or https://www.ffmpeg.org/download.html"
echo "If you're going to run LIST via Docker, ignore the above message, as FFMPEG it's already installed on Docker image"
