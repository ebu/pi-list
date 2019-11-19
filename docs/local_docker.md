# How to run your instance of LIST

The easiest way to run the LIST application locally is to use the [image in dockerhub](https://hub.docker.com/r/ebutech/pi-list/).

You'll need:

- **Docker** >= v15
- **Docker-compose** >= v1.20


You can launch the docker containers with the following commands.

```sh
mkdir ~/ebu-pi-list
cd ~/ebu-pi-list
curl -O https://raw.githubusercontent.com/ebu/pi-list/master/docs/docker-compose.yml
docker-compose up
```

You're good to go: `http://localhost`

## Exposing LIST to the network

The steps above will restrict the usage of LIST on the machine where the docker containers are being run. In order to allow it to be used from other machines, you just need to edit the docker-compose.yml file and change the line indicated below, replacing ${EBU_LIST_WEB_APP_DOMAIN} with your URL (in the example below, replace 192.168.1.1 with the IP address of your machine):

Change:

```EBU_LIST_WEB_APP_DOMAIN=${EBU_LIST_WEB_APP_DOMAIN}```

to

```EBU_LIST_WEB_APP_DOMAIN=http://192.168.1.1```

or

```sh
export EBU_LIST_WEB_APP_DOMAIN=http://192.168.1.1
docker-compose up
```

## Choose a local folder for data

A docker volume `listserver` is created by default for persistent storage of files (pcap, decoded data, sdp). In case there is a dedicated folder/disk on the host for that purpose, it is possible to set this specific path to be mounted as a volume.

```sh
export EBU_LIST_HOST_DATA_FOLDER=/mnt/
docker-compose up
```
