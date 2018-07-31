FROM gcc:7.2

# Install node
RUN curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install -y nodejs
RUN apt-get install -y ffmpeg

RUN npm install -g serve

ENV LD_LIBRARY_PATH ${LD_LIBRARY_PATH}:/usr/local/lib/

COPY bin/ /app/bin/
COPY lib/ /usr/local/lib
COPY listwebserver/ /app/listwebserver/
COPY listwebserver/config.yml /app/listwebserver/
COPY gui/ /app/gui/

RUN cd /app/listwebserver/ && npm install

CMD cd /app/ && serve -s gui -p 8080 & cd /app/listwebserver/ && npm start -- config.yml --dev