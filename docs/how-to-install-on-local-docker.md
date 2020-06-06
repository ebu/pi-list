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

  listserver:
    image: ebutech/pi-list # using the latest version
    ports:
      - "80:80"
      - "443:443"
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
      - ${EBU_LIST_HOST_DATA_FOLDER:-listserver}:/home/

volumes:
  mongo:
  listserver:
  influxdb:
~~~~

### Start containerized EBU LIST
- Make sure you are located in the folder containing the docker-compose.yml file. 
- Execute the following instructions:

~~~~
LIST:EBU-LIST$ docker login -u <username> 
LIST:EBU-LIST$ docker-compose pull

WARNING: The EBU_LIST_WEB_APP_DOMAIN variable is not set. Defaulting to a blank string.
WARNING: The EBU_LIST_LIVE_MODE variable is not set. Defaulting to a blank string.
Pulling influxdb    ... downloading (71.3%)
Pulling mongo       ... waiting
Pulling rabbitmq    ... download complete
Pulling list_server ... downloading (71.3%)
...
~~~~
When all images are downloaded:

`Note: to use https, change the url to https://localhost:443 on the following commands`

`Note: If you already have the LIST running, you must stop all the containers. Please see Troubleshooting section in the end of this page`


~~~~
LIST:EBU-LIST$ EBU_LIST_WEB_APP_DOMAIN=http://localhost:80 docker-compose up

WARNING: The EBU_LIST_LIVE_MODE variable is not set. Defaulting to a blank string.
Creating network "documents_default" with the default driver
Creating volume "documents_mongo" with default driver
Creating volume "documents_listserver" with default driver
Creating volume "documents_influxdb" with default driver
Creating documents_rabbitmq_1 ... done
Creating documents_influxdb_1 ... done
Creating documents_mongo_1    ... done
Creating documents_list_server_1 ... done
Attaching to documents_mongo_1, documents_influxdb_1, documents_rabbitmq_1, documents_list_server_1
...
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
- Go to: http://localhost or https://localhost if using https
- Create a user: enter a valid email address
- Create a password
- Click register
- Click login

You will be redirected to the main interface of EBU LIST

You are ready to drop your pcap file on the canvas …

## Troubleshooting

### Cleaning up your local Docker instance

`Warning: Volumes used by the running containers will not be pruned. Stop all containers first.`
~~~~
docker system prune --volumes
~~~~

### Force the browser not to use the cache

`Note: A better way is to clean the entire browser cache.`

Add a URL parameter with some random numbers to force the browser not to use the cached information.

Example: http://localhost/?t=783827

### Prune docker images

`Warning: Images used by the running containers will not be pruned. Stop all containers first.`

~~~
docker system prune -af
~~~

### Manually stop running containers

List all running containers:
~~~
docker ps
~~~
~~~
docker stop <NAME of the running container>
~~~
