# Deep.Memo App

[SDK](https://github.com/deep-foundation/sdk) based application, with configured [@deep-foundation/deepmemo-imports](https://github.com/deep-foundation/deepmemo-imports).

[![Gitpod](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/deep-foundation/deepmemo-app) 
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label&color=purple)](https://discord.gg/deep-foundation)

## ENVS

```
export NEXT_PUBLIC_GQL_PATH=localhost:3006/gql;
export NEXT_PUBLIC_GQL_SSL=0;
```

## Description

All features from `deepmemo-imports` enabled and visulized in app.

Application support:

| Feature | web-chrome | web-safari | web-ios | web-android | app-ios | app-android | app-mac | app-win | app-linux |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Device | 🟢 | 🟢 | 🟢 | 🔵 | 🔵 | 🔵 | 🟢 | 🔵 | 🔵 | 🔵 |
| Geolocation | 🟢 | 🟢 | 🟢 | 🔵 | 🔵 | 🔵 | 🟢 | [🟠](https://github.com/ionic-team/capacitor/issues/1858) | [🟠](https://github.com/ionic-team/capacitor/issues/1858) | [🟠](https://github.com/ionic-team/capacitor/issues/1858) |
| Voice | 🟢 | 🔵 | 🔵 | 🔵 | 🔵 | 🔵 | 🔵 | 🔵 | 🔵 | 🔵 |
| Contacts | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| Camera | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| Action | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| Haptics | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| Motion | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| Network | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| Reader | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |

- 🔴 not realized
- 🟣 in process
- 🟠 has problem, may  be link to issue
- 🔵 realized but not tested
- 🟢 tested