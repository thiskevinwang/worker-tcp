declare module 'cloudflare:test' {
	// Controls the type of `import("cloudflare:test").env`
	interface ProvidedEnv extends Env {
		// https://github.com/cloudflare/workers-sdk/blob/main/fixtures/vitest-pool-workers-examples/d1/test/env.d.ts
	}

	// Ensure RPC properties and methods can be accessed with `SELF`
	// https://github.com/cloudflare/workers-sdk/blob/main/fixtures/vitest-pool-workers-examples/rpc/test/env.d.ts
	export const SELF: Service<import('../src/index').default>;
}
