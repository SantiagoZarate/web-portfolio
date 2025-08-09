---
slug: pnpm-monorepo-vercel-deploy
date: 2025-08-09
title: GitHub Actions + pnpm Workspaces → Vercel Deploy
category: vercel
description: CI workflow for deploying a pnpm monorepo's front-end from root via Vercel CLI.
---

pnpm workspaces

Cuando se usan monorepos siempre usar Vercel CLI desde root, no desde los subdirectorios.

Setup:

```bash
- package.json
- .vercel
- /apps
- - /www
- - /api
- /packages
- - /utils
- - /database
```

At the root of the project

- pnpm-workspaces.yml

vercel as dev dependencies

```bash
pnpm vercel login
```

En caso de ya tener el proyecto creado en vercel

```bash
pnpm vercel link
```

set the root directory in .vercel/project.json to apps/<front/www/client>

Hacer el build en local y hacer el despliegue, para evitar tener que hacer el build en Vercel

```bash
pnpm vercel build --prod
```

```bash
pnpm vercel deploy --prod --prebuilt
```

## Common Issues

### Styles Jsx

```bash
`Error: ENOENT: no such file or directory, lstat '/node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.23.2_react@18.2.0/node_modules/styled-jsx/index.js'`
```

Solution: Este error me pasaba porque estaba corriendo el build desde apps/www, pero el paquete styled-jsx estaba siendo `hoisteado` en el root del proyecto, porque en mi `.npmrc` tenia node-linker=isolated, lo que hice fue correr los comandos de vercel CLI desde el root del proyecto

### ERR_INVALID_THIS

We need to enable corepack support, set ENABLE_EXPERIMENTAL_COREPACK in vercel envs and make sure to have packageManager property in package.json of the source code

### Zod Union Types

Add zod import reference to `./node_modules/zod` in tsconfig.json

### Medusajs Publishable Key

The error was that i set an key to access to my backend, but the i got hit with the error message 'use an appropriate publishable key', and i was sure i was using the same keys both in the FE and BE, but i was using different keys, then i updated the key in vercel enviroment variables settings, and then i redeployed it, still was facing the same error and was because the env key was being cached.

to solve it i just built the project locally and the deploy it again, this way the env vars are not being cached.
