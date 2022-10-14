# How to configure Upstash for local development

## Get credentials from Upstash

Create or login to [Upstash](https://upstash.com/). In your [console](https://console.upstash.com/) select Redis database. On `Details` page scroll down to `REST API` section and copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

![](images/upstash.jpg)

## Create env file

Create `.env.local` file with Upstash APL env variables.

```
NEXT_PUBLIC_UPSTASH_TOKEN=
NEXT_PUBLIC_UPSTASH_URL=
```
