class MessageTokenLengthExceeded extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MessageTokenLengthExceeded';
    }
}
class UnableToSetSystemMessage extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnableToSetSystemMessage';
    }
}

export { MessageTokenLengthExceeded, UnableToSetSystemMessage };
