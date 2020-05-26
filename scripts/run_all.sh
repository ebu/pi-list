#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
SRC=$DIR/..

INSTALL=0
RUN_ALL=0
RUN_TESTS=0

usage() { echo "$0 usage:" && grep " .)\ #" $0; exit 0; }
[ $# -eq 0 ] && usage

while getopts ":hirt" arg; do
    case $arg in
        i) # Install dependencies
            INSTALL=1
        ;;
        
        r) # Run all
            RUN_ALL=1
        ;;

        t) # Run tests
            RUN_TESTS=1
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

run () {
    echo "Launch $1 $2"
    cd "$SRC/$1" && $2
}

declare -a INSTALLS=("js/common_server" "apps/listwebserver" "apps/gui" "apps/capture_probe" "apps/live_generator")

if [ $INSTALL -eq 1 ] ; then
    echo "INSTALL"
    ## now loop through the above array
    for d in "${INSTALLS[@]}"
    do
        echo "Installing in $d"
        run "$d" "npm install"
    done
fi

if [ $RUN_ALL -eq 1 ] ; then
    echo "RUN_ALL"
    launch "apps/listwebserver" "npm run dev -- $HOME/.list/config.yml --dev --live"
    launch "apps/gui" "npm start"
    launch "apps/capture_probe" "npm run dev -- config.yml"
fi

if [ $RUN_TESTS -eq 1 ] ; then
    echo "RUN_TESTS"

    ctest
    RET_CTEST=$?

    cd "$SRC/apps/listwebserver" && ./node_modules/.bin/jest
    RET_WS_TESTS=$?

    cd "$SRC/apps/gui" && ./node_modules/.bin/jest
    RET_GUI_TESTS=$?

    echo RET_CTEST: $RET_CTEST
    echo RET_WS_TESTS: $RET_WS_TESTS
    echo RET_GUI_TESTS: $RET_GUI_TESTS

    ALL=$((RET_CTEST + RET_WS_TESTS + RET_GUI_TESTS))
    echo ALL: $ALL

    exit $ALL
fi

