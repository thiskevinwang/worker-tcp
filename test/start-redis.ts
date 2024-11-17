import { execSync } from 'child_process';

import type { GlobalSetupContext } from 'vitest/node';

export async function setup({ provide }: GlobalSetupContext) {
	console.log('[GLOBAL SETUP]');
	execSync('docker run --rm -d -p 6379:6379 --name test-redis redis');
}

export async function teardown() {
	console.log('[GLOBAL TEARDOWN]');
	execSync('docker stop test-redis');
}

declare module 'vitest' {
	export interface ProvidedContext {}
}
