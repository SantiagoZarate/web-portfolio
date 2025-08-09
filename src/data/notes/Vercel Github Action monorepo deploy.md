---
slug: vercel-github-actions-monorepo
date: 2025-08-09
title: Deploying pnpm Monorepo to Vercel
category: vercel
description: Best practices for running `vercel build` & `vercel deploy --prebuilt` from repo root.
---

When using a pnpm workspaces monorepo, and wanting to automate the deploy to vercel i use github actions alongside the Vercel CLI

Setup

First of all we need to get a Vercel Token from Vercel -> Settings, also make sure we already have a vercel project, we are gonna need the vercel org id and project id.

Set up the github secrets in the repository settings, with the following names.

```bash
VERCEL_TOKEN=<token>
VERCEL_ORG_ID=<ord-id>
VERCEL_PROJECT_ID=<project-id>
```

now its time to create the github actions that is gonna automate the deploy to vercel, the yml file has to be place at `.github/workflows`

the gh actions is gonna look like this:

```yaml
name: Vercel Production Deployment
env:
	VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
	VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
on:
	push:
		branches:
			- main
jobs:
	Deploy-Production:
	runs-on: ubuntu-latest
	steps:
	- uses: actions/checkout@v4
	- name: Setup pnpm
	  uses: pnpm/action-setup@v3
      with:
		version: 10.6.5
	- name: Install Vercel CLI
	  run: pnpm install --global vercel@latest
	- name: Pull Vercel Environment Information
	  run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
	- name: Build Project Artifacts
	  run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
	- name: Deploy Project Artifacts to Vercel
	run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

it downloads the vercel cli, builds the project and the deploy the output to vercel, its important to note that the cli commands are gonna be run from the monorepo, which may cause some issues, because the vercel cli build command looks for the package `nextjs`to be installed, which, in most of the cases is not gonna be installed at the root, but rather in apps/<client/www/web>.

So make sure to set the root directory to apps/<client/www/web> in the vercel enviroment variables, this way during the github action execution, when it pull the envs from vercel it already know where our application is at

(This step)

```bash
- name: Pull Vercel Environment Information
	  run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
```

when we use a monorepo, but for some reason we don't have packages installed from the same monorepo we can use a different approach, instead of setting the root directory in vercel enviroment variables, we can set the directory from where the vercel commands are gonna be executed, to do this we need to add the following instructions in our yml file:

```bash
name: Vercel Production Deployment
env:
	VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
	VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
on:
	push:
		branches:
			- main
jobs:
	Deploy-Production:
	runs-on: ubuntu-latest
	defaults:
		run:
			working-directory: ./apps/client
	steps:
	- uses: actions/checkout@v4
	- name: Setup pnpm
	  uses: pnpm/action-setup@v3
      with:
		version: 10.6.5
	- name: Install Vercel CLI
	  run: pnpm install --global vercel@latest
	- name: Pull Vercel Environment Information
	  run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
	- name: Build Project Artifacts
	  run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
	- name: Deploy Project Artifacts to Vercel
	run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

in that file i added the `defaults` instructions, where i specified the directory to run the commands
