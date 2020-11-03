#!/bin/bash

PORT=$(echo $EBU_LIST_WEB_APP_DOMAIN | sed -e 's,^.*:,:,g' -e 's,.*:\([0-9]*\).*,\1,g' -e 's,[^0-9],,g')
PROTOCOL=$(echo $EBU_LIST_WEB_APP_DOMAIN | sed -e 's,^\(.*://\).*,\1,g' -e 's,[^A-Za-z],,g')

if [ ! -n "$PORT" ]; then
    PORT='80'
fi
if [ ! -n "$PROTOCOL" ]; then
    PROTOCOL='http'
fi

for dir in gui listwebserver; do
    sed -i "s/\"publicApiPort\".*/\"publicApiPort\" : \"${PORT}\",/g;
            s/\"publicApiProtocol\".*/\"publicApiProtocol\" : \"${PROTOCOL}\"/g" \
            /app/${dir}/static.config.json
done
