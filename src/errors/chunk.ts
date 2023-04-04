class ChunkHandlerError extends Error {
    constructor(message: string, error?: Error) {
        super(message);
        this.name = 'ChunkHandlerError';
        this.stack = error?.stack || this.stack;
    }
}

export { ChunkHandlerError };
