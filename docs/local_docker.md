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

You're good to go: `http://localhost:8080`

## Exposing LIST to the network

The steps above will restrict the usage of LIST on the machine where the docker containers are being run. In order to allow it to be used from other machines, you just need to edit the docker-compose.yml file and change the line indicated below, replacing ${EBU_LIST_WEB_APP_DOMAIN} with your URL (in the example below, replace 192.168.1.1 with the IP address of your machine, but keep the :8080):

Change:

```EBU_LIST_WEB_APP_DOMAIN=${EBU_LIST_WEB_APP_DOMAIN}```

to

```EBU_LIST_WEB_APP_DOMAIN=http://192.168.1.1:8080```
