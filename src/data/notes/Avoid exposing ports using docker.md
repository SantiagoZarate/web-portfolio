---
slug: avoid-exposing-ports-docker
date: 2025-08-09
title: Docker Bridge Networks for Private DB/API
category: docker
description: Creating named bridge networks and limiting port exposure to localhost.
---

The other day i was wondering if i was able to access to my services hosted on a vps using the ip of the vps and the port where the docker service was running on, something like this:

```bash
curl <vps-ip>:9000/health
```

i got a 200 Status code response, which indicated that i could do it, that rang a bell in me, even tho I'm not hosting a db in that vps, i wonder what could've happened if i did, somebody could try to brute force its way to the db, so i had to do something.

I learnt about of some of the docker network drivers, by default docker creates a bridge at `127.17.0.0/16` and whenever we spin up a new container this is gonna be attached to that subnet by default, we can see what are the container in a bridge by running:

```bash
docker inspect <bridge-name>
```

the terminal will show us a json with the information regarding that network, the field "Containers" contains all the containers using that network with some other information like its ip addreses.

That's ok, but when using various docker containers that need to talk to each other is better not to expose its port and just put them in the same network, that's were the second docker driver comes in, well in reality its still a bridge connection, but now we are gonna name it.

Lets say we create a new network where i'm gonna sit a database and a simple api, first we need to declare the new docker network:

```bash
docker network create --driver bridge my-network
```

this is gonna create a new bridge connection, lets say `127.18.0.0/16` for instance.

and then in a docker compose file we could do something like this:

```yml
services:
	database:
		image: postgres:12-alpine
		network
			- "my-network"
	api:
		image: node-api-rest:latest
		network
			- "my-network"
		ports:
			- 127.0.0.1:3000:3000

# Optionally we could declare the network right here, docker will create it for us
# networks:
#	my-network
#		driver: "bridge"
```

we can see that i didn't specify the database port, because i don't need to, if both services are in the same network docker includes DNS resolution, so i could resolve the database ip by the service name, that pretty neat.

Also pay attention to how i expose the 3000 port only for localhost, this way nobody besides the host can access the node api, to forward request to port 3000 we'll need to use nginx or caddy.

To verify we are not exposing the database port we can run the following command:

```bash
sudo ss -tunlp | grep docker
```

and we are gonna see all the ports exposed, we should see the port `127.0.0.1:3000` that's where the node api is running.
