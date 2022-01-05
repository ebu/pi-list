#!/bin/bash

PORT=$(echo $EBU_LIST_WEB_APP_DOMAIN | sed -e 's,^.*:,:,g' -e 's,.*:\([0-9]*\).*,\1,g' -e 's,[^0-9],,g')
PROTOCOL=$(echo $EBU_LIST_WEB_APP_DOMAIN | sed -e 's,^\(.*://\).*,\1,g' -e 's,[^A-Za-z],,g')

if [ ! -n "$PORT" ]; then
    PORT='80'
fi
if [ ! -n "$PROTOCOL" ]; then
    PROTOCOL='http'
fi

LIVE_MODE=${EBU_LIST_LIVE_MODE:-false}

STATIC_CONFIG=/app/listwebserver/static.config.json

sed -i "s/\"publicApiPort\".*/\"publicApiPort\" : \"${PORT}\",/g;
        s/\"publicApiProtocol\".*/\"publicApiProtocol\" : \"${PROTOCOL}\",/g;
        s/\"liveMode\".*/\"liveMode\" : \"${LIVE_MODE}\"/g" \
        $STATIC_CONFIG

ln -s $STATIC_CONFIG /app/gui/static.config.json
ln -s $STATIC_CONFIG /var/data/nginx/static.config.json
