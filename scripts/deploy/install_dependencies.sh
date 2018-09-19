#!/bin/bash

NPMdependencies=()

if which node > /dev/null
then
    echo "node is installed, skipping..."
else
    apt install -y curl
    curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
    bash nodesource_setup.sh
    apt install -y nodejs npm
fi

for dep in "${NPMdependencies[@]}"
do
    if which $dep > /dev/null
    then
        echo "$dep is installed, skipping..."
    else
        npm install -g $dep
    fi
done