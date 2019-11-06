#!/bin/bash

cd $(dirname $0)

echo "Monitoring containers..."
docker-compose logs -f --tail=500
