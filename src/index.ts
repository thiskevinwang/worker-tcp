import { WorkerEntrypoint } from 'cloudflare:workers';
import { connect } from 'cloudflare:sockets';

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { Cache } from '@/cache/redis';

const app = new Hono<{ Bindings: Env; Variables: { cache: Cache } }>();

app.notFound(async (c) => {
	return c.json({ error: 'not found' }, { status: 404 });
});

app.onError(async (e, c) => {
	console.error(e);
	return c.json({ error: 'internal server error' }, { status: 500 });
});

app.use(async (c, next) => {
	const cache = new Cache(connect({ hostname: c.env.REDIS_HOST, port: c.env.REDIS_PORT }));
	await cache.AUTH(c.env.REDIS_PASSWORD);
	c.set('cache', cache);
	await next();
	await cache.close();
});

app.get('/get/:key', async (c) => {
	const key = c.req.param('key');

	const res = await c.var.cache.GET(key);
	return c.json({ res });
});

app.post('/set/:key', zValidator('json', z.object({ value: z.string() })), async (c) => {
	const key = c.req.param('key');
	const body = c.req.valid('json');

	const res = await c.var.cache.SET(key, body.value);
	return c.json({ res });
});

app.delete('/del/:key', async (c) => {
	const key = c.req.param('key');

	const res = await c.var.cache.DEL(key);
	return c.json({ res });
});

app.post('/setex/:key', zValidator('json', z.object({ value: z.string(), seconds: z.number() })), async (c) => {
	const key = c.req.param('key');
	const body = c.req.valid('json');

	const res = await c.var.cache.SETEX(key, body.seconds, body.value);
	return c.json({ res });
});

export default class extends WorkerEntrypoint<Env> {
	async fetch(req: Request) {
		return app.fetch(req, this.env, this.ctx);
	}

	async _flushDB() {
		const cache = new Cache(connect({ hostname: this.env.REDIS_HOST, port: this.env.REDIS_PORT }));
		await cache.AUTH(this.env.REDIS_PASSWORD);
		return cache.FLUSHDB();
	}
}
