import { SELF } from 'cloudflare:test';
import { afterAll, describe, expect, it } from 'vitest';

const buildRequest = (method: 'GET' | 'POST' | 'DELETE', path: string, bodyObj?: any) => {
	const url = new URL(path, 'https://example.com');
	const headers = new Headers();

	const requestInit = { method } as RequestInit;

	if (method === 'POST') {
		headers.set('Content-Type', 'application/json');
		requestInit.headers = headers;
		if (bodyObj) {
			requestInit.body = JSON.stringify(bodyObj);
		}
	}
	return new Request(url, requestInit);
};

describe('worker tcp sockets', () => {
	// clean up after all tests
	afterAll(async () => {
		const res = await SELF._flushDB();
		expect(res).toBe('OK');
	});

	it('should return 404 for a non-existent route', async () => {
		const req = buildRequest('GET', '/non-existent');
		const res = await SELF.fetch(req);

		expect.soft(res.status).toBe(404);
		expect(await res.json()).toEqual({ error: 'not found' });
	});

	it('should SET and GET and DEL a value', async () => {
		let req = buildRequest('POST', '/set/hello', { value: 'world' });
		let res = await SELF.fetch(req);
		let body = await res.json();

		expect.soft(res.status).toBe(200);
		expect(body).toEqual({ res: 'OK' });

		req = buildRequest('GET', '/get/hello');
		res = await SELF.fetch(req);
		body = await res.json();

		expect.soft(res.status).toBe(200);
		expect(body).toEqual({ res: 'world' });

		req = buildRequest('DELETE', '/del/hello');
		res = await SELF.fetch(req);
		body = await res.json();

		expect.soft(res.status).toBe(200);
		expect(body).toEqual({ res: 1 });

		req = buildRequest('DELETE', '/del/hello');
		res = await SELF.fetch(req);
		body = await res.json();

		expect.soft(res.status).toBe(200);
		expect(body).toEqual({ res: 0 });
	});

	it('should SETEX a value', async () => {
		const req = buildRequest('POST', '/setex/foo', { value: 'world', seconds: 60 });
		const res = await SELF.fetch(req);
		const body = await res.json();

		expect.soft(res.status).toBe(200);
		expect(body).toEqual({ res: 'OK' });
	});
});
