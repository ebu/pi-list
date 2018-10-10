#!/bin/bash

# get cmake 3.9
echo "deb http://ftp.debian.org/debian stretch-backports main" > /etc/apt/sources.list.d/stretch-backports.list
apt update
apt -t stretch-backports install -y --no-install-recommends cmake

# utilities
apt install -y curl rsync python-pip
pip install conan

# node
curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
bash nodesource_setup.sh
apt install -y nodejs npm
rm -f nodesource_setup.sh

apt install -y uuid-dev libpcap-dev

echo "Please install FFMPEG v2.8 or newer using your package manager or https://www.ffmpeg.org/download.html"
echo "If you're going to run LIST via Docker, ignore the above message, as FFMPEG it's already installed on Docker image"
