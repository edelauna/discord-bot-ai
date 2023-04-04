class MessageTokenLengthExceeded extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MessageTokenLengthExceeded';
    }
}

export { MessageTokenLengthExceeded };
