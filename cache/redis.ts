export class Cache {
	private socket: Socket;

	private writer: WritableStreamDefaultWriter;
	private reader: ReadableStreamDefaultReader;
	private encoder: TextEncoder;
	private decoder: TextDecoder;

	constructor(socket: Socket) {
		this.socket = socket;

		this.writer = socket.writable.getWriter();
		this.reader = socket.readable.getReader();
		this.encoder = new TextEncoder();
		this.decoder = new TextDecoder();
	}

	async close() {
		return this.socket.close();
	}

	#encode(command: string): Uint8Array {
		return this.encoder.encode(command);
	}

	#decode(response: Uint8Array): string {
		return this.decoder.decode(response);
	}

	async #send(command: string) {
		// pad with CRLF
		if (!command.endsWith(CRLF)) {
			command += CRLF;
		}
		await this.writer.write(this.#encode(command));
		const res = await this.reader.read();

		// decode response
		const decoded = this.#decode(res.value);
		return deserialize(decoded);
	}

	async AUTH(password: string) {
		return this.#send(`AUTH ${password}`);
	}

	async SET(key: string, value: string) {
		return this.#send(`SET ${key} ${value}`);
	}

	/**
	 * https://redis.io/docs/latest/commands/get/
	 */
	async GET(key: string) {
		return this.#send(`GET ${key}`);
	}

	/**
	 * https://redis.io/docs/latest/commands/setex/
	 */
	async SETEX(key: string, seconds: number, value: string) {
		return this.#send(`SETEX ${key} ${seconds} ${value}`);
	}

	/**
	 * https://redis.io/docs/latest/commands/del/
	 */
	async DEL(key: string) {
		return this.#send(`DEL ${key}`);
	}

	/**
	 * https://redis.io/docs/latest/commands/flushdb/
	 */
	async FLUSHDB() {
		return this.#send('FLUSHDB');
	}
}

/** Carriage Return Line Feed */
const CRLF = '\r\n';
const CRLFRegex = /\r\n$/;

/**
 * Deserialize a response, based on the Redis Protocol
 * https://redis.io/docs/latest/develop/reference/protocol-spec
 */
function deserialize(redisResponse: string) {
	// Simple Strings: https://redis.io/docs/latest/develop/reference/protocol-spec/#simple-strings
	if (redisResponse.startsWith('+')) {
		return redisResponse.slice(1).replace(CRLFRegex, '');
	}

	// Bulk Strings: https://redis.io/docs/latest/develop/reference/protocol-spec/#bulk-strings
	if (redisResponse.startsWith('$')) {
		const [length, data, _] = redisResponse.slice(1).split(CRLF);
		const len = Number(length);

		if (len === -1) {
			return null;
		}

		return data;
	}

	// Integers: https://redis.io/docs/latest/develop/reference/protocol-spec/#integers
	if (redisResponse.startsWith(':')) {
		return Number(redisResponse.slice(1));
	}

	// Simple errors: https://redis.io/docs/latest/develop/reference/protocol-spec/#simple-errors
	if (redisResponse.startsWith('-')) {
		throw new Error(redisResponse.slice(1).replace(CRLFRegex, ''));
	}

	return redisResponse;
}
