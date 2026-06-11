#!/usr/bin/env bash

set -euo pipefail

IMAGE_VERSION=$1
docker scout cves --only-fixed --only-severity critical,high --locations ebutech/pi-list:$IMAGE_VERSION
