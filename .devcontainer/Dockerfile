FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -qq && apt-get install -y --no-install-recommends \
        software-properties-common wget apt-utils file zip \
        openssh-client gpg-agent socat rsync \
        make ninja-build git \
        python3 python3-pip python3-venv \
        curl libpcap-dev libssl-dev uuid-dev ffmpeg bzip2
        
RUN apt-get install -y vim nano tmux tmuxinator
RUN git config --global core.editor vim

# Install conan into a virtualenv to avoid PEP 668 "externally-managed" errors
# Install conan (pin to 1.x series). Use `conan<2` to ensure the legacy 1.x client is installed
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/python -m pip install --upgrade pip setuptools wheel && \
    /opt/venv/bin/python -m pip install "conan<2" && \
    ln -s /opt/venv/bin/conan /usr/local/bin/conan
    
# By default, anything you run in Docker is done as superuser.
# Conan runs some install commands as superuser, and will prepend `sudo` to
# these commands, unless `CONAN_SYSREQUIRES_SUDO=0` is in your env variables.
ENV CONAN_SYSREQUIRES_SUDO=0
# Some packages request that Conan use the system package manager to install
# a few dependencies. This flag allows Conan to proceed with these installations;
# leaving this flag undefined can cause some installation failures.
ENV CONAN_SYSREQUIRES_MODE=enabled

# Install CMake 3.19.8 (supports CMP0110 policy) from the official binary installer
ARG CMAKE_VERSION=3.19.8
RUN wget -O /tmp/cmake-${CMAKE_VERSION}-Linux-x86_64.sh \
        https://cmake.org/files/v3.19/cmake-${CMAKE_VERSION}-Linux-x86_64.sh && \
    chmod +x /tmp/cmake-${CMAKE_VERSION}-Linux-x86_64.sh && \
    /tmp/cmake-${CMAKE_VERSION}-Linux-x86_64.sh --skip-license --prefix=/usr/local && \
    rm -f /tmp/cmake-${CMAKE_VERSION}-Linux-x86_64.sh
