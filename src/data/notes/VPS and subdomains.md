---
slug: vps-subdomains-nginx-letsencrypt
date: 2025-08-01
title: Subdomains, Nginx & Let's Encrypt on a VPS
category: web
description: Proxy multiple services (n8n, Medusa) via subdomains with HTTPS certs by certbot.
---

Im my journey with vps's and self hosting i found myself with the question

¿Do i need a domain per each services i wanted to run?

and no, you don't need a new domain per service, we can instead use subomains.

I was running a 2gb of ram and single core vps that i bought in [ovhcloud](https://www.ovhcloud.com/en/) for almost 5$, such a great deal compared to others providers where they would offer just 1gb for the same price, i wanted to try [hetzner](https://www.hetzner.com/) but at the time of buying it i didn't have a credit card.

The only downside with ovhcloud is that the vps i bought is being hosted in Canada, which adds a little latency for me because im from Argentina.

In that vps i had running a docker container with a n8n service, nothing really fancy, i also bought this domain nomeimporta.xyz for $1 in namecheap, the docker container was listening on port 5678 on localhost, to make it accesible for incoming request i had to proxy the request coming to nomeimporta.xyz to localhost:5678.

To do so i used nginx, a web server that allows request proxy, i added the following configuration to `/etc/nginx/sites-enabled/n8n.conf` (first make sure to install nginx in the vps):

```bash
server {
    server_name www.nomeimporta.xyz;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

that's ok but i needed to make it work though HTTPS, to do so first i needed to generate a ssl certificate, that's where `letsencrypt` comes in handy, by running the following command i could generate certs for my domain:

```bash
sudo certbot --nginx -d www.nomeimporta.xyz
```

> [!Help] Error generating cert
> If that command resulted in an error that may be because our DNS was not pointing to the vps ip, so i went to cloudflare and set a new DNS record for the domain nomeimporta.xyz of type A pointing to my vps ip (Prior to this, our domain registrar nameserver should be pointing to cloudflare, and make sure to have DNSSEC turned off in the registrar)

to make sure the cert was created i could run the following command

```bash
sudo ls -la /etc/letsencrypt/live
```

now i could finally update the nginx config using the certs, to something like this:

```bash
server {
    listen 443 ssl;
    server_name www.nomeimporta.xyz;

    ssl_certificate /etc/letsencrypt/live/www.nomeimporta.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.nomeimporta.xyz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name www.nomeimporta.xyz;
    return 301 https://$host$request_uri;
}

```

the setup was already done, i could now go to nomeimporta.xyz and see the n8n login page as expected

i wanted to take the most out of the vps, when i saw the resources consumption of it only 0.5gb of ram were being used, so i had at least 1gb free to run something else. So intead of using the free tier or render to host a backend api and having to wait for the server to restart after some inactivity i decided to self host medusajs, a headless node eCommerce, i then spin up another docker container, this time with the medusa store in there.

so i learnt that i could use subdomains to make the medusajs api and admin frontend accessible to the internet, i wanted to do something like

```bash
n8n.nomeimporta.xyz -> localhost:5678 (n8n dashboard)
api.nomeimporta.xyz -> localhost:9000 (medusajs eccomerce)
```

i had to tweak the nginx conf a little bit and also generate new certs for each subdomain, first of all i needed to add a basic nginx config like this:

```bash
# n8n over HTTP
server {
    server_name n8n.nomeimporta.xyz;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# api (Medusa) over HTTP
server {
    server_name api.nomeimporta.xyz;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

this way im serving the services through http, now i needed to generate the certs, for that i ran the following command:

```bash
sudo certbot --nginx -d n8n.nomeimporta.xyz -d api.nomeimporta.xyz
```

then i needed to reference the certs in the nginx config to allow https

```bash
# n8n over HTTPS
server {
    listen 443 ssl;
    server_name n8n.nomeimporta.xyz;

    ssl_certificate /etc/letsencrypt/live/n8n.nomeimporta.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.nomeimporta.xyz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# api (Medusa) over HTTPS
server {
    listen 443 ssl;
    server_name api.nomeimporta.xyz;

    ssl_certificate /etc/letsencrypt/live/api.nomeimporta.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.nomeimporta.xyz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name n8n.nomeimporta.xyz;
    return 301 https://$host$request_uri;
}

server {
    listen 80;
    server_name api.nomeimporta.xyz;
    return 301 https://$host$request_uri;
}
```

now both services can be accessed using their subdomains
