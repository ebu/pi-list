#!/bin/bash

PORT=$(echo $EBU_LIST_WEB_APP_DOMAIN | sed -e 's,^.*:,:,g' -e 's,.*:\([0-9]*\).*,\1,g' -e 's,[^0-9],,g')

if [ -n "$PORT" ]
then
      sed -i "s/\"publicApiPort\".*/\"publicApiPort\" : \"${PORT}\"/g" /app/gui/static.config.json
      sed -i "s/\"publicApiPort\".*/\"publicApiPort\" : \"${PORT}\"/g" /app/listwebserver/static.config.json
else
      sed -i "s/\"publicApiPort\".*/\"publicApiPort\" : 80/g" /app/gui/static.config.json
      sed -i "s/\"publicApiPort\".*/\"publicApiPort\" : 80/g" /app/listwebserver/static.config.json
fi