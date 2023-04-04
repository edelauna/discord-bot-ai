import { DISCORD_MAX_CHARS } from '../../config/app';
import { ChunkHandlerError } from '../../errors/chunk';
import { chunkHandler, clearActiveChunks } from '../../handlers/chunk';
import { send, sendTyping } from '../../util/send';

jest.mock('../../util/send', () => ({
    send: jest.fn(),
    sendTyping: jest.fn(),
}));

describe('chunkHandler', () => {
    const channelId = '123';
    const data = { content: 'Hello, world!' };

    let sendMock: jest.MockedFunction<typeof send>;
    let sendTypingMock: jest.MockedFunction<typeof sendTyping>;

    beforeEach(() => {
        jest.resetAllMocks();
        sendMock = send as jest.MockedFunction<typeof send>;
        /**
         * I don't think this is the correct way to test this - probably need to look at how to handle the
         * stream of data from /handlers/openai/chat-completions to process all the promises in order.
         * maybe like a Promise queue which awaits each promise in sequence.
         */
        sendMock.mockImplementation(async () => await sendTypingMock(channelId));
        sendTypingMock = sendTyping as jest.MockedFunction<typeof sendTyping>;
        sendTypingMock.mockResolvedValue(undefined);
        // Clear activeChunks before each test
        clearActiveChunks();
    });

    afterEach(() => {
        sendMock.mockRestore();
    });

    it('should handle a single chunk', () => {
        const payload = { channelId, end: false, data };
        const result = chunkHandler(payload);
        expect(result).toBe(data.content);
    });

    it('should handle multiple chunks', () => {
        const payload1 = { channelId, end: false, data: { role: 'assistant' } };
        const longString = 'a'.repeat(2 * DISCORD_MAX_CHARS);
        const payload2 = { channelId, end: false, data: { content: longString } };
        chunkHandler(payload1);
        const result = chunkHandler(payload2);
        expect(result).toBe('a'.repeat(493));
        expect(sendMock).toHaveBeenCalledTimes(1);
        expect(sendTypingMock).toHaveBeenCalledTimes(1);
    });

    it('should handle a mix of long and short chunks', () => {
        const shortString = 'Hello';
        const longString = 'a'.repeat(2 * DISCORD_MAX_CHARS);
        const payload1 = { channelId, end: false, data: { content: shortString } };
        const payload2 = { channelId, end: false, data: { content: longString } };
        const payload3 = { channelId, end: true };
        const result1 = chunkHandler(payload1);
        expect(result1).toBe(payload1.data.content);
        const result2 = chunkHandler(payload2);
        expect(result2).toBe('a'.repeat(5));
        const result3 = chunkHandler(payload3);
        expect(result3).toBe('a'.repeat(5));
        expect(sendMock).toHaveBeenCalledTimes(2);
        expect(sendTypingMock).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if an error is passed', () => {
        const error = new Error('Test error');
        const errorHandler = jest.fn();
        const expectedError = new ChunkHandlerError('Error while building chunk', error);
        const payload = { channelId, resolver: { error: errorHandler }, error };
        chunkHandler(payload);
        expect(errorHandler).toHaveBeenCalledWith(expectedError);
    });
});
