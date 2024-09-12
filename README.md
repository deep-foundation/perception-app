# Deep.Perception App

[SDK](https://github.com/deep-foundation/sdk) based application, with configured [@deep-foundation/perception-imports](https://github.com/deep-foundation/perception-imports).

[![Gitpod](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/deep-foundation/perception-app) 
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label&color=purple)](https://discord.gg/deep-foundation)


## Development

With regenerate imports/preloaded.json
```
GQL="<GQL_URL>" TOKEN="<ADMIN_TOKEN>" npm run dev
```

Without regenerate imports/preloaded.json
```
npm run dev
```

Regenerate imports/preloaded.json even if dev already runned
```
GQL="<GQL_URL>" TOKEN="<ADMIN_TOKEN>" npm run preload
```

For fast editing depended packages, initial commands:

> If perception-imports and/or deeplinks cloned, then `npm run dev` automatically copy into perception-app/node_modules.

```
npm ci; (git clone https://github.com/deep-foundation/perception-imports.git; cd perception-imports; npm ci); (git clone https://github.com/deep-foundation/deeplinks.git; cd deeplinks; npm ci);
```

## ENVS

```
export NEXT_PUBLIC_GRAPHQL_URL=https://deeplinks.deep.foundation/gql;
export NEXT_PUBLIC_GQL_SSL=1;
```
