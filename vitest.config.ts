import { defineWorkersProject } from '@cloudflare/vitest-pool-workers/config';
import tsconfigPaths from 'vite-tsconfig-paths'; // use v4 for non-ESM support

// See: https://github.com/cloudflare/workers-sdk/blob/main/fixtures/vitest-pool-workers-examples/d1/vitest.config.ts
export default defineWorkersProject(async () => {
	return {
		plugins: [tsconfigPaths()],
		test: {
			globalSetup: ['./test/start-redis.ts'],
			poolOptions: {
				workers: {
					wrangler: { configPath: './wrangler.toml', environment: 'test' },
					miniflare: {
						compatibilityFlags: ['nodejs_compat'],
					},
				},
			},
		},
	};
});
