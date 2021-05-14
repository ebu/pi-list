#!/bin/bash

bash /app/sedstaticconfig.sh &
service nginx start &
serve -s /app/gui -p 8080 &
npm start -- config.yml --dev &

# Relaunch if it crashes
while true; do ./bin/stream_pre_processor amqp://rabbitmq:5672 ; done
