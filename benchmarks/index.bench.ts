import { SELF } from 'cloudflare:test';
import { bench, describe } from 'vitest';

describe('benchmarks', () => {
	bench('get keys', async () => {
		const request = new Request('https://example.com/get/hello');
		await SELF.fetch(request);
	});
});
