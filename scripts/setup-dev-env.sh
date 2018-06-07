#!/bin/bash

sudo apt-get install -y uuid-dev libpcap-dev

conan config install https://github.com/bisect-pt/conan_config.git

echo "Please install FFMPEG v2.8 or newer using your package manager or https://www.ffmpeg.org/download.html"
echo "If you're going to run LIST via Docker, ignore the above message, as FFMPEG it's already installed on Docker image"
