import { DISCORD_MAX_CHARS } from '../../config/app';
import { chunkHandler, clearActiveChunks } from '../../handlers/chunk';
import { send } from '../../util/send';

jest.mock('../../util/send', () => ({
    send: jest.fn(),
    sendTyping: jest.fn(),
}));

describe('chunkHandler', () => {
    const channelId = '123';
    const data = { content: 'Hello, world!' };

    let sendMock: jest.MockedFunction<typeof send>;

    beforeEach(() => {
        sendMock = send as jest.MockedFunction<typeof send>;
        sendMock.mockResolvedValue();
        // Clear activeChunks before each test
        clearActiveChunks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle a single chunk', () => {
        const payload = { channelId, data };
        chunkHandler(payload);
        chunkHandler({ channelId: channelId, last: true });
        expect(sendMock).toHaveBeenCalledWith(channelId, data.content);
    });

    it('should handle multiple chunks', () => {
        const payload1 = { channelId, data: { role: 'assistant' } };
        const longString = 'a'.repeat(2 * DISCORD_MAX_CHARS);
        const payload2 = { channelId, data: { content: longString } };
        chunkHandler(payload1);
        chunkHandler(payload2);
        expect(sendMock).toHaveBeenCalledWith(channelId, 'a'.repeat(493));
    });

    it('should handle a mix of long and short chunks', () => {
        const shortString = 'Hello';
        const longString = 'a'.repeat(2 * DISCORD_MAX_CHARS);
        const payload1 = { channelId, data: { content: shortString } };
        const payload2 = { channelId, data: { content: longString } };
        const payload3 = { channelId, last: true };
        chunkHandler(payload1);
        chunkHandler(payload2);
        chunkHandler(payload3);
        expect(sendMock).toHaveBeenCalledWith(channelId, payload1.data.content + 'a'.repeat(488));
        expect(sendMock).toHaveBeenCalledWith(channelId, 'a'.repeat(493));
        expect(sendMock).toHaveBeenCalledWith(channelId, 'a'.repeat(5));
    });
});
