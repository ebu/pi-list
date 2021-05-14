#!/bin/bash

DEFAULT_WEB_APP_DOMAIN=$"http://localhost:8080"
RED='\033[0;31m'
NC='\033[0m' # No Color

# Improovments:
#   Check the echo redirection on the entire file stderr and stdout
#    redirections can be usefull for CI implementations



#########################
# The command line help #
#########################
display_help() {
    echo -e $1 '\n'
    echo "Usage: $0 {start|stop|restart|remove|prune|monitor} [option...]" >&2
    echo
    echo "   {start} [option...]    : Start the containers"
    echo "   -m    Start with live output logs"
    echo
    echo " * {stop}/{restart}       : Stop or restart the containers"
    echo " * {remove}               : Stop and remove the containers"
    echo " * {prune}                : Stop and remove the containers and images"
    echo " * {monitor}              : live output logs from the containers"
    exit 1
}

start()
{
    echo -e "Starting containers..." '\n'
    if [ "$1" = '-m' ] || [ "$2" = '-m' ]
    then
        docker-compose up --build
    else
        docker-compose up --build -d
    fi
    echo -e "Started!" '\n'
    exit
}

stop()
{
    echo -e "Stopping containers..." '\n'
    docker-compose stop
    echo -e "Stopped!" '\n'
    exit
}

restart()
{
    stop
    start
    echo -e "Restarted!" '\n'
    exit
}

remove()
{
    echo -e "Removing..." '\n'
    docker-compose down -v
    echo -e "Removed!" '\n'
    exit
}

prune()
{
    echo -e "Pruning..." '\n'
    docker-compose rm -f -s -v
    echo -e "Pruned!" '\n'
    exit
}

monitor()
{
    echo -e "Monitoring containers..." '\n'
    docker-compose logs -f --tail=500
    echo -e "No longer monitoring containers!" '\n'
    exit
}

################################
# Check if parameters options  #
# are given on the commandline #
################################
if [ $# -lt 1 ]
then
    display_help "Invalid arguments"
    exit
fi

if [ $1 = 'start' ]
then
    start $2 $3
elif [ $1 = 'stop' ]
then
    stop
elif [ $1 = 'restart' ]
then
    restart
elif [ $1 = 'remove' ]
then
    remove
elif [ $1 = 'prune' ]
then
    prune
elif [ $1 = 'monitor' ]
then
    monitor
else
    display_help "Can't find any suitable argument."
fi