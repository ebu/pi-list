# This is the LIST server's runtime Dockerfile

FROM ubuntu:25.10

ENV DEBIAN_FRONTEND=noninteractive

# Debian Buster archives were moved to archive.debian.org; 
# The lines below switch apt sources to archive.debian.org and disable the
# 'Valid-Until' check so `apt-get update` succeeds for EOL releases.
# RUN sed -i 's|deb.debian.org|archive.debian.org|g; s|security.debian.org|archive.debian.org|g' /etc/apt/sources.list || true
# RUN printf 'Acquire::Check-Valid-Until "false";\n' > /etc/apt/apt.conf.d/99no-check-valid-until

RUN apt-get update && apt-get install --no-install-recommends -yq  \
        ca-certificates \
        curl \
        wireshark-common \
        nginx && \
        rm -rf /var/lib/apt/lists/*

RUN update-ca-certificates

# Install node
RUN curl -sL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh && \
        bash nodesource_setup.sh && \
        apt-get install -y --no-install-recommends \
        ffmpeg \
        zip \
        nodejs && \
        rm -rf /usr/lib/node_modules/npm && \
        rm -f /usr/bin/npm /usr/bin/npx && \
        rm -f nodesource_setup.sh && \
        rm -rf /var/lib/apt/lists/*

ENV LD_LIBRARY_PATH=/usr/local/lib:${LD_LIBRARY_PATH}

COPY app/ /app
COPY lib/ /usr/local/lib
# nginx Configuration
COPY data/config/ /etc/nginx/
# nginx certs
COPY data/certs/ /etc/ssl/certs/
# for static content
RUN mkdir -p /var/data/nginx/
RUN chown -R www-data:www-data /var/data/nginx/

WORKDIR /app/listwebserver/

CMD bash launch.sh
