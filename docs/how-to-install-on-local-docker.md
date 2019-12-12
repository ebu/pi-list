# A short guide to installing and running EBU-LIST as a containerized application

## Abstract
This short guide is covering one of the methods for making use of the EBU Live IP Software Toolkit. You will be guided through installing Docker Desktop, creating a docker-compose YAML file and starting the application.
## Tools
https://www.docker.com/products/docker-desktop
https://hub.docker.com/r/ebutech/pi-list

### Install Docker Desktop
- Go to https://hub.docker.com
- Create a free account
- Download Docker Desktop: https://www.docker.com/products docker-desktop
- Install the version appropriate to your operating system
- Make sure to start Docker Desktop

### Get docker-compose.yml
- Create a new folder on your system
- Example folder name: EBU-LIST
- curl -O https://raw.githubusercontent.com/ebu/pi-list/master/docs/docker-compose.yml
- This newly created file should look like:
~~~~
version: "3"
services:
 influxdb:
   image: influxdb:1.4.2
   volumes:
     - influxdb:/var/lib/influxdb

 mongo:
   image: mongo:4.1.10
   volumes:
     - mongo:/data/db

 rabbitmq:
   image: pedroalvesferreira/rabbitmq-with-web-mqtt
   ports:
     - "5672:5672"
     - "15672:15672"
     - "15675:15675"

 list_server:
   image: ebutech/pi-list # using the latest version
   ports:
     - "80:80"
     - "8080"
     - "3030"
   environment:
       - EBU_LIST_WEB_APP_DOMAIN=${EBU_LIST_WEB_APP_DOMAIN}
       - EBU_LIST_LIVE_MODE=${EBU_LIST_LIVE_MODE}
   links:
     - influxdb
     - mongo
     - rabbitmq
   volumes:
     - listserver:/home/

volumes:
 mongo:
 listserver:
 influxdb:
~~~~

### Start containerized EBU LIST
- Make sure you are located in the folder containing the docker-compose.yml file. 
- Execute the following instructions:

~~~~
docker login -u <username> 
docker-compose pull
EBU_LIST_WEB_APP_DOMAIN=http://localhost:80 docker-compose up
~~~~

This should result in the following:

~~~~
LIST:EBU-LIST$ ls
docker-compose.yml

LIST:EBU-LIST$ docker login -u <username> 
Password: 
Login Succeeded

LIST:EBU-LIST$ docker-compose up
Creating network "test_default" with the default driver
Creating volume "test_mongo" with default driver
Creating volume "test_listserver" with default driver
Creating volume "test_influxdb" with default driver
Pulling influxdb (influxdb:1.4.2)...
1.4.2: Pulling from library/influxdb
723254a2c089: Pull complete
920d0ed5293b: Pull complete
4e6d61de962a: Extracting [===============>  

~~~~
You are one step away from using the application.

- Open Google Chrome
- Go to: http://localhost
- Create a user: enter a valid email address
- Create a password
- Click register
- Click login

You will be redirected to the main interface of EBU LIST

You are ready to drop your pcap file on the canvas …

### Cleaning up your local Docker instance

~~~~
docker system prune --volumes
~~~~

