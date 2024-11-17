# Worker TCP Sockets Redis

This is a simple worker project that connects to Redis over [TCP sockets](https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/)

## Prerequisites

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/en/) >= 20

## Quick Start

Terminal window 1
```console
user@machine:~ $ docker run --rm -p 6379:6379 --name some-redis redis
```

Terminal window 2
```console
user@machine:~ $ wrangler npx wrangler dev
```

## Testing

Tests will spin up a local Redis server and run the tests against it.

```console
user@machine:~ $ npx vitest
```

## Benchmarking

TODO..

Currently getting an error when running `npx vitest bench`

```console
FAIL  benchmarks/index.bench.ts > benchmarks > get keys
Error: Test function is not found. Did you add it using `setFn`?
```
https://github.com/vitest-dev/vitest/blob/0b08bc11c42f57fc589760f226ce840837fe2f7a/packages/runner/src/run.ts#L233
