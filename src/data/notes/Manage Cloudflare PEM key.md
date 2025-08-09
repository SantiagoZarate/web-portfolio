---
slug: cloudflare-pem-key-management
date: 2025-08-09
title: JWT with jose on Cloudflare Workers
category: web
description: Replacing jsonwebtoken with jose and cleaning PEM keys for atob()/ArrayBuffer use.
---

I was building a simple hono api on cloudflare workers, i needed to append rows in a Google sheet, i followed most of [this guide](https://www.jacobparis.com/content/submit-form-google-sheet) and everything worked fined except the step where i get the Google access token.

The main problem was that because my api was running in cloudflare workers, it didnt have access to all the node js api's, and the `jsonwebtoken` package happens to rely on the buffer nodejs api, thats why i needed to switch `jsonwebtoken` for `jose`, a web compliant package to deal with jwt's.

in the proccess i needed a function to decode my pem key, that's where a function from cloudflare comes in called `atob()`, which was giving me some issues at the moment of parse my google PEM key.

```javascript
function str2ab(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "")
    .trim();

  const binary = atob(b64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);

  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}
```

During local development i didn't have any issues, i set my secret like this in the .dev.vars file:

```bash
GOOGLE_SERVICE_KEY="-----BEGIN PRIVATE KEY-----\n<key>\n-----END PRIVATE KEY-----\n"

```

I was getting the following error code in production:

> [!Error] Atob error
> "Error in getProducts: InvalidCharacterError: atob() called with invalid base64-encoded data. (Only whitespace, '+', '/', alphanumeric ASCII, and up to two terminal '=' signs when the input data length is divisible by 4 are allowed.)"

first of all i went to my worker cloudflare dashboard and set a new secret, called GOOGLE_SERVICE_KEY and pasted my pem key like this:

```bash
"-----BEGIN PRIVATE KEY-----\n<key>\n-----END PRIVATE KEY-----\n"
```

and i thought that was ok, but i needed to first clean it, removing all the quotes and `\n`, then my cleaned PEM key looked like this:

```bash
-----BEGIN PRIVATE KEY-----
<key>
-----END PRIVATE KEY-----
```

and that was it, next time i would just use the wrangler cli to set up my secret, as it seems to be a more secure way to set secrets
