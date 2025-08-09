---
slug: vps-hardening-checklist
date: 2025-08-09
title: VPS Hardening Checklist
category: security
description: SSH port move, root disable, endlessh tarpit, ufw, auto-updates, nginx reverse proxy.
---

## From the Vps

- [ ] Remove login with password and disable root login as well
- [ ] Move ssh port to somewhere else to prevent invalid connections
- [ ] Run endlessh on port 22 so that whoever tries to connect get sent to the tarpit
- [ ] Install `unattended-upgrades` to automatically update packages and avoid potential exploits.
- [ ] Install `ufw (uncomplicated firewall)` to avoid exposing ports, (write up) by default it denies all incoming request and allow all outgoing requests, we need to allow the following ports: - The new SSH port: `sudo ufw allow <ssh-port>/tcp` - HTTP & HTTPS ports: `sudo ufw allow http` & `sudo ufw allow https`
- [ ] when running a docker container that needs to expose ports make sure to expose it only to the host
- [ ] Install nginx to reverse proxy incoming requests

## From Cloudflare

- [ ] Setup WAF (Web Application Firewall) rules
- [ ] Setup caching rules
