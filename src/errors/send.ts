class SendError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SendError';
    }
}

class SendTypingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SendTypingError';
    }
}

export { SendError, SendTypingError };
