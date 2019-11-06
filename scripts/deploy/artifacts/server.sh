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
    echo "   -c    Ask for configuration"
    echo
    echo " * {stop}/{restart}       : Stop or restart the containers"
    echo " * {remove}               : Stop and remove the containers"
    echo " * {prune}                : Stop and remove the containers and images"
    echo " * {monitor}              : live output logs from the containers"
    exit 1
}

private_parse_url()
{
    PROJECT_URL=$1

    # Extract the protocol (includes trailing "://").
    PARSED_PROTO="$(echo $PROJECT_URL | sed -nr 's,^(.*://).*,\1,p')"

    # Remove the protocol from the URL.
    PARSED_URL="$(echo ${PROJECT_URL/$PARSED_PROTO/})"

    # Extract the user (includes trailing "@").
    PARSED_USER="$(echo $PARSED_URL | sed -nr 's,^(.*@).*,\1,p')"

    # Remove the user from the URL.
    PARSED_URL="$(echo ${PARSED_URL/$PARSED_USER/})"

    # Extract the port (includes leading ":").
    PARSED_PORT="$(echo $PARSED_URL | sed -nr 's,.*(:[0-9]+).*,\1,p')"
    if [ -z "$PARSED_PORT" ]
    then
        if [ "${PARSED_PROTO,,}" = "https://" ]
        then
            PARSED_PORT=":443"
        elif [ "${PARSED_PROTO,,}" = "http://" ]
        then
            PARSED_PORT=":80"
        fi
    fi

    # Remove the port from the URL.
    PARSED_URL="$(echo ${PARSED_URL/$PARSED_PORT/})"

    # Extract the path (includes leading "/" or ":").
    PARSED_PATH="$(echo $PARSED_URL | sed -nr 's,[^/:]*([/:].*),\1,p')"

    # Remove the path from the URL.
    PARSED_HOST="$(echo ${PARSED_URL/$PARSED_PATH/})"
}

reconfigure_environment()
{
    if [ -z "$EBU_LIST_WEB_APP_DOMAIN" ]
    then
        # This export will only be present inside this children shell execution
        export EBU_LIST_WEB_APP_DOMAIN=$DEFAULT_WEB_APP_DOMAIN
    fi

    if [ "$1" = 1 ]
    then
        echo -e "This configuration is valid?" '\n'

        echo "Press Enter to assume the previous values."
        read -p "EBU_LIST_WEB_APP_DOMAIN  [${EBU_LIST_WEB_APP_DOMAIN}]: " NEW_EBU_LIST_WEB_APP_DOMAIN
        if [ -n "$NEW_EBU_LIST_WEB_APP_DOMAIN" ]
        then
            # This export will only be present inside this children shell execution
            export EBU_LIST_WEB_APP_DOMAIN=$NEW_EBU_LIST_WEB_APP_DOMAIN
        fi

        read -p "EBU_LIST_LIVE_MODE  [${EBU_LIST_LIVE_MODE}]: " NEW_EBU_LIST_LIVE_MODE
        if [ -n "$NEW_EBU_LIST_LIVE_MODE" ]
        then
            # This export will only be present inside this children shell execution 
            export  EBU_LIST_LIVE_MODE=$NEW_EBU_LIST_LIVE_MODE;
        fi
    fi

    private_parse_url $EBU_LIST_WEB_APP_DOMAIN

    if [ -z "$PARSED_PROTO" ]
    then
        echo -e "" '\n'
        echo -e "${RED}Missing protocol. EBU_LIST_WEB_APP_DOMAIN must be in the format {protocol://}{host-or-ip}[optional {:port}]${NC}" '\n'
        reconfigure_environment
    fi

    eval 'sed -i "s/\"publicApiPort\".*/\"publicApiPort\" : \"$(echo $PARSED_PORT | sed s/://g)\"/g" ./server/app/gui/static.config.json'
    eval 'sed -i "s/-*\".*:80\"/\"$(echo $PARSED_PORT | sed s/://g):80\"/g" ./docker-compose.yml'
}

start()
{
    if [ "$1" = '-c' ] || [ "$2" = '-c' ]
    then
        reconfigure_environment 1 #1 means to reconfigure, else use default values
    else
        reconfigure_environment
    fi
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
    echo -e "Prunning..." '\n'
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