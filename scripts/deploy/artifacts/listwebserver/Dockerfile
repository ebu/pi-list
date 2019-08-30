# This is the LIST server's runtime Dockerfile

FROM gcc:7.2

# Install node
RUN curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install -y \
        ffmpeg \
        zip \
        nodejs \
        wireshark

RUN npm install -g serve

ENV LD_LIBRARY_PATH ${LD_LIBRARY_PATH}:/usr/local/lib/

ADD app/ /app
ADD js/ /js
ADD lib/ /usr/local/lib

WORKDIR /js/common_server
RUN rm -rf node_modules
RUN npm install

WORKDIR /app/listwebserver/
RUN rm -rf node_modules
RUN npm install

CMD serve -s /app/gui -p 8080 & npm start -- config.yml --dev
