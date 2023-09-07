import { streamHandler } from '../../../handlers/openai/stream';
import * as chunk from '../../../handlers/chunk';
import { runners } from '../../../svcs/runner';
import { Message } from 'discord.js';
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk } from 'openai/resources/chat';

jest.mock('../../../handlers/chunk');
jest.mock('../../../svcs/runner');
class StreamMock {
    controller;

    constructor(controller = { abort: jest.fn() }) {
        this.controller = controller;
    }

    // mock implementation for the asyncIterator method
    async *[Symbol.asyncIterator]() {
        yield { choices: [{ delta: 'the' }] };
        yield { choices: [{ delta: 'data' }] };
    }
}

describe('streamHandler', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('parses valid JSON data and calls the callback', async () => {
        const mockStream = new StreamMock() as unknown as Stream<ChatCompletionChunk>;
        const mockCallback = jest.spyOn(chunk, 'chunkHandler').mockResolvedValue(undefined);
        const referenceId = 'ref1';
        const mockRunners = runners as jest.MockedObject<typeof runners>;
        mockRunners[referenceId] = { status: 'running', message: { channelId: 'channel1' } as Message };

        // Call the streamHandler function.
        await streamHandler(mockStream, referenceId);

        // Assert that the mockCallback function was called with the correct arguments.
        expect(mockCallback).toHaveBeenCalledTimes(3);
        expect(mockCallback).toHaveBeenCalledWith({ referenceId, data: 'the' });
        expect(mockCallback).toHaveBeenCalledWith({ referenceId, data: 'data' });
        expect(mockCallback).toHaveBeenCalledWith({ referenceId, last: true });
    });

    it('destroys the stream if runner is aborted', async () => {
        const mockController = {
            abort: jest.fn(),
        };
        const mockStream = new StreamMock(mockController) as unknown as Stream<ChatCompletionChunk>;
        const referenceId = 'ref1';
        const mockCallback = jest.spyOn(chunk, 'chunkHandler').mockResolvedValue(undefined);
        const mockRunners = runners as jest.MockedObject<typeof runners>;
        mockRunners[referenceId] = { status: 'aborted', message: { channelId: 'channel1' } as Message };

        await streamHandler(mockStream, referenceId);

        // Assert that the mockCallback function was called with the correct arguments.
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith({ referenceId, last: true });

        // Assert that the Promise resolves without errors.
        await expect(mockController.abort).toHaveBeenCalledTimes(1);
    });
});
