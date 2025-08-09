---
slug: ssh-key-only-authentication
date: 2025-08-09
title: SSH Key-Only Authentication on Ubuntu VPS
category: security
description: Disabling password login and overriding cloud-init configs under sshd_config.d.
---

Today i wanted to improve some security aspects of managing a vps, i read that is discouraged to have enabled the ssh password authentication, and its a better idea just to use ssh keys.

To do this, in my vps i have to tweak some options in the _/etc/ssh/sshd_config_ file (Make sure is sshd_config and not ssh_config, yes i did edit the wrong file), i needed to set theses options:

```bash
PasswordAuthentication no
AuthorizedKeysFile   .ssh/authorized_keys
PubkeyAuthentication yes
```

and then run _sudo service ssh reload_ to apply the new changes, then from my local machine i could ssh into my vps and login right away, but that was not the case because in the sshd*config file there's a line that includes all the configs files from */etc/ssh/sshd*config.d/.config* that overrides the main configurations, by default, Ubuntu installations add a config file that sits at _/etc/ssh/sshd_config/50-cloud-init.conf_ and has this only option:

```bash
# /etc/ssh/sshd_config/50-cloud-init.conf
PasswordAuthentication yes
```

that forces prompting a password when connecting to vps via ssh, i just set it to _no_ and it worked as expected.

For better clarity, i added a file in `/etc/ssh/sshd_config.d/00-only-pub-auth.conf` with the options i previously tweak, this way i know what are the default ssh values, and which ones are my personal configurations, and because my custom file as a lower double digit prefix it has more priority than the one created by the Ubuntu installer.

Now in my local machine, i learnt that i can define some sort of alias to ssh into different vps more easily, i created the following file

```bash
# ~/.ssh/config
Host ovh
	HostName <vps-ip>
	User <vps-user>
	IdentityFiles ~/.ssh/<ssh-private-key>
	PubKeyAuthentication yes
	IdentitiesOnly yes # <-- it ensures to only use the identify file, and not make lookup for other private keys
```

now i could simply type

`ssh ovh`

instead of

`ssh -i ~/.ssh/<ssh-private-key> <vps-user>@<vps-ip>`

The only thing is that i still need to pass the private ssh key passphrase to desencrypt the key, which is kind of annoying but there's a workaround, using ssh agents, to do so i first need to start a ssh-agent

```bash
eval "$(ssh-agent -s)"
```

and then add the key to the agent cache

```bash
ssh-add ~/.ssh/<private-key>
```

and then enter the passphrase.

Useful links:

- [what is 50-cloud-init.conf](https://askubuntu-com.translate.goog/questions/1516262/why-is-50-cloud-init-conf-created?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc)
