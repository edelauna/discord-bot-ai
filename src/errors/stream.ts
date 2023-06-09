class StreamDataError extends Error {
    constructor(message: string, error?: Error) {
        super(message);
        this.name = 'StreamDataError';
        this.stack = error?.stack || this.stack;
    }
}
class StreamInterruptedError extends Error {
    constructor(message: string, error?: Error) {
        super(message);
        this.name = 'StreamInterruptedError';
        this.stack = error?.stack || this.stack;
    }
}

export { StreamDataError, StreamInterruptedError };
