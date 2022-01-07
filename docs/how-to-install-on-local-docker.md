# A short guide to installing and running EBU-LIST as a containerized application

## Abstract

The easiest way to run the LIST application locally is to use [the Docker image available in Docker Hub](https://hub.docker.com/r/ebutech/pi-list/).

This short guide explains how to do it, step by step. You will be guided through installing Docker Desktop, creating a docker-compose YAML file and starting the application.

## Tools

You'll need:

-   **Docker** >= v15
-   **Docker-compose** >= v1.20
-   **curl**

To verify if you have the required software, open a console and run:

```
> docker -v
```

The output should be something like this:

```
> docker -v
Docker version 18.03.1-ce, build 9ee9f40
```

If you get an error, or if the version is older than the one mentioned above, you'll need to install Docker.

### Install Docker Desktop

-   Download Docker Desktop: https://www.docker.com/products docker-desktop
-   Install the version appropriate to your operating system
-   Make sure to start Docker Desktop

### Verify the docker-compose version

Execute the following command:

```
docker-compose version 1.22.0, build f46880fe
```

The output should be similar to:

```
> docker-compose -v
docker-compose version 1.22.0, build f46880fe
```

If you get an error, or if the version is older than the one mentioned above, you'll need to install a recent version of docker-compose. Go to https://docs.docker.com/compose/install/.

### Get the EBU LIST docker-compose.yml file

-   Create a new folder on your system
-   Example folder name: EBU-LIST
-   cd into that directory and execute the following command:

```
> curl -O https://raw.githubusercontent.com/ebu/pi-list/master/docs/docker-compose.yml
```

### Start the EBU LIST container

-   Make sure you are located in the folder containing the docker-compose.yml file.

-   Update EBU LIST to the latest version:

```
> docker-compose pull
```

-   The output should be similar to this:

```
WARNING: The EBU_LIST_WEB_APP_DOMAIN variable is not set. Defaulting to a blank string.
WARNING: The EBU_LIST_LIVE_MODE variable is not set. Defaulting to a blank string.
Pulling influxdb    ... downloading (71.3%)
Pulling mongo       ... waiting
Pulling rabbitmq    ... download complete
Pulling list_server ... downloading (71.3%)
...
```

-   Then, when all images are downloaded:

```
> docker-compose up
```

-   The output should be similar to this:

```
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
```

-   You are one step away from using the application.

-   Open Google Chrome
-   Go to `http://localhost​`
-   Create a user: enter a valid email address
-   Create a password
-   Click register
-   Click login

You will be redirected to the main interface of EBU LIST

### Stopping EBU LIST

-   If you have started LIST using `docker-compose up`, you just need to press Control-C once and wait for the containers to stop.

### Launching EBU LIST as a daemon

#### Starting

-   Go to the directory where the docker-compose.yml file is located.
-   Launch docker-compose with the `-d` flag:

```
> docker-compose up -d
```

LIST will keep running in the background, even when you close the shell.

You can verify that with docker ps:

```
> docker ps
```

There should be several containers executing:

```
CONTAINER ID        IMAGE
d2c9f4c1dec5        ebutech/pi-list
af742c333ac9        mongo:4.1.10
307c55c2eb0b        pedroalvesferreira/rabbitmq-with-web-mqtt
bc45384dc9cd        influxdb:1.4.2
```

#### Stopping

-   Go to the directory where the docker-compose.yml file is located. _Make sure you are in the right directory._

-   Stop the containers:

```
> docker-compose down
```

## Troubleshooting

### Cleaning up your local Docker instance

`Warning: Volumes used by the running containers will not be pruned. Stop all containers first.`

```
> docker system prune --volumes
```

### Force the browser not to use the cache

`Note: A better way is to clean the entire browser cache.`

Add a URL parameter with some random numbers to force the browser not to use the cached information.

Example: http://localhost/?t=783827

### Prune docker images

`Warning: Images used by the running containers will not be pruned. Stop all containers first.`

```
> docker system prune -af
```

### Manually stop running containers

List all running containers:

```
> docker ps
```

```
> docker stop <name of the container>
```

## Advanced options

### Exposing LIST to the network

The steps above will restrict the usage of LIST on the machine where the docker containers are being run. In order to allow it to be used from other machines, you just need to edit the docker-compose.yml file and change the line indicated below, replacing ${EBU_LIST_WEB_APP_DOMAIN} with your URL (in the example below, replace 192.168.1.1 with the IP address of your machine). To specify a new port, please see the next section :

`Note: to use https, change the URL to https://*******:443 on the following commands`

Change:

`EBU_LIST_WEB_APP_DOMAIN=${EBU_LIST_WEB_APP_DOMAIN}`

to

`EBU_LIST_WEB_APP_DOMAIN=http://192.168.1.1:80`

or

```sh
export EBU_LIST_WEB_APP_DOMAIN=http://192.168.1.1:80
docker-compose up
```

### Choosing a different port

To change the default port from 80 to another port please do the following:
Edit the docker-compose.yml file and change the line indicated below. That line exposes the docker port to the user network.
Also replacing ${EBU_LIST_WEB_APP_DOMAIN} with your URL.

Example: Change the default port 80 to port 81.

`Note: Change 443 if using HTTPS`

Old:

```yml
  ...
  listserver:
    image: ebutech/pi-list # using the latest version
    ports:
      - "80:80"
      - "443:443"
   ...
```

New:

```yml
  ...
  listserver:
    image: ebutech/pi-list # using the latest version
    ports:
      - "81:80"
      - "443:443"
   ...
```

Change:

`EBU_LIST_WEB_APP_DOMAIN=${EBU_LIST_WEB_APP_DOMAIN}`

to

`EBU_LIST_WEB_APP_DOMAIN=http://localhost:81`

or

```sh
export EBU_LIST_WEB_APP_DOMAIN=http://localhost:81
docker-compose up
```

### Choosing a local folder for data

A docker volume `listserver` is created by default for persistent storage of files (pcap, decoded data, SDP). In case there is a dedicated folder/disk on the host for that purpose, it is possible to set this specific path to be mounted as a volume.

```sh
export EBU_LIST_HOST_DATA_FOLDER=/mnt/
docker-compose up
```

### Activate the capture AKA live mode

This option allows to capture network packets to create your own pcap files by unlocking a dedicated page in the web interface.

```sh
export EBU_LIST_LIVE_MODE=true
docker-compose up
```

Note that the capture engine is not included in this project. Plus, your system needs to meet a list of additional requirements:
Hardware-timestamp-capable NIC, PTP synchronization, a stream source, etc.
