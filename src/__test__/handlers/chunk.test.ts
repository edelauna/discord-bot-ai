import type { Message } from 'discord.js';
import { DISCORD_MAX_CHARS } from '../../config/app';
import { chunkHandler, clearActiveChunks } from '../../handlers/chunk';
import { runners } from '../../svcs/runner';
import { send } from '../../util/send';
import { ChatCompletionChunk } from 'openai/resources/chat';

jest.mock('../../util/send', () => ({
    send: jest.fn(),
    sendTyping: jest.fn(),
}));
jest.mock('../../svcs/runner');

describe('chunkHandler', () => {
    const referenceId = 'ref-123';
    const channelId = '123';
    const data = { content: 'Hello, world!' };

    let sendMock: jest.MockedFunction<typeof send>;

    beforeEach(() => {
        sendMock = send as jest.MockedFunction<typeof send>;
        sendMock.mockResolvedValue();
        const mockRunners = runners as jest.MockedObject<typeof runners>;
        mockRunners[referenceId] = { message: { channelId: channelId } as Message, status: 'running' };
        // Clear activeChunks before each test
        clearActiveChunks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle a single chunk', () => {
        const payload = { referenceId, data };
        chunkHandler(payload);
        chunkHandler({ referenceId, last: true });
        expect(sendMock).toHaveBeenCalledWith(channelId, data.content);
    });

    it('should handle multiple chunks', () => {
        const payload1 = { referenceId, data: { role: 'assistant' } as ChatCompletionChunk.Choice.Delta };
        const longString = 'a'.repeat(2 * DISCORD_MAX_CHARS);
        const payload2 = { referenceId, data: { content: longString } };
        chunkHandler(payload1);
        chunkHandler(payload2);
        expect(sendMock).toHaveBeenCalledWith(channelId, 'a'.repeat(493));
    });

    it('should handle a mix of long and short chunks', () => {
        const shortString = 'Hello';
        const longString = 'a'.repeat(2 * DISCORD_MAX_CHARS);
        const payload1 = { referenceId, data: { content: shortString } };
        const payload2 = { referenceId, data: { content: longString } };
        const payload3 = { referenceId, last: true };
        chunkHandler(payload1);
        chunkHandler(payload2);
        chunkHandler(payload3);
        expect(sendMock).toHaveBeenCalledWith(channelId, payload1.data.content + 'a'.repeat(488));
        expect(sendMock).toHaveBeenCalledWith(channelId, 'a'.repeat(493));
        expect(sendMock).toHaveBeenCalledWith(channelId, 'a'.repeat(5));
    });
});
