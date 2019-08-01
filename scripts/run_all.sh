#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
SRC=$DIR/..

INSTALL=0
RUN_ALL=0

usage() { echo "$0 usage:" && grep " .)\ #" $0; exit 0; }
[ $# -eq 0 ] && usage

while getopts ":hir" arg; do
    case $arg in
        i) # Install dependencies
            INSTALL=1
        ;;
        
        r) # Run all
            RUN_ALL=1
        ;;
        
        h | *) # Display help.
            usage
            exit 0
        ;;
    esac
done

launch () {
    echo "Launch $1 $2"
    cd "$SRC/$1" && gnome-terminal --window-with-profile=KeepOpen -- $2
}

declare -a INSTALLS=("js/common_server" "apps/listwebserver" "apps/gui" "apps/capture_probe")

if [ $INSTALL -eq 1 ] ; then
    echo "INSTALL"
    ## now loop through the above array
    for d in "${INSTALLS[@]}"
    do
        echo "Installing in $d"
        launch "$d" "npm install"
    done
fi

if [ $RUN_ALL -eq 1 ] ; then
    echo "RUN_ALL"
    launch "apps/listwebserver" "npm run dev -- ~/.list/config.yml --dev --live"
    launch "apps/gui" "npm start"
    launch "apps/capture_probe" "npm run dev -- config.yml"
fi

