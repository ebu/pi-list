#!/bin/bash

bash /app/gen_static_config.sh &
service nginx start &
node ./static_server.js /app/gui 8080 &
node ./dist/server.js config.yml --dev &

# Relaunch if it crashes
while true; do ../bin/stream_pre_processor amqp://rabbitmq:5672 ; done
