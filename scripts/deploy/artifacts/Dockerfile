FROM gcc:7.2

# Install node
RUN curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install -y nodejs
RUN apt-get install -y ffmpeg

RUN npm install -g serve

ENV LD_LIBRARY_PATH ${LD_LIBRARY_PATH}:/usr/local/lib/

ADD server/app/ /app
ADD server/lib/ /usr/local/lib

WORKDIR /app/listwebserver/
RUN npm install

CMD serve -s /app/gui -p 8080 & npm start -- config.yml --dev
