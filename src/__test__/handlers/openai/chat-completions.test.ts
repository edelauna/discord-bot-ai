import { IncomingMessage } from 'http';
import { streamHandler } from '../../../handlers/openai/chat-completions';
import { ChunkHandler } from '../../../handlers/chunk';


describe('streamHandler', () => {
    it('parses valid JSON data and calls the callback', async () => {
        const mockStream = {
            on: jest.fn(),
        };
        const mockCallback = jest.fn((args: ChunkHandler) => {
            if (args.resolver?.end) args.resolver.end();
        });
        const channelId = 'channel1';

        const testData = ['data: {"choices":[{"delta":5}]}', 'data: {"choices":[{"delta":10}]}', 'data: [DONE]'];

        // Create a Promise that resolves after the "end" event is emitted.
        const streamPromise = new Promise<void>((resolve) => {
            mockStream.on.mockImplementation((eventName, listener) => {
                if (eventName === 'data') {
                    for (const data of testData) {
                        listener(Buffer.from(`${data}\n\n`));
                    }
                }
                else if (eventName === 'end') {
                    listener();
                    resolve();
                }
            });
        });

        // Call the streamHandler function.
        await streamHandler(mockStream as unknown as IncomingMessage, channelId, mockCallback);

        // Assert that the mockStream.on function was called with the correct arguments.
        expect(mockStream.on).toHaveBeenCalledTimes(3);
        expect(mockStream.on).toHaveBeenCalledWith('data', expect.any(Function));
        expect(mockStream.on).toHaveBeenCalledWith('end', expect.any(Function));
        expect(mockStream.on).toHaveBeenCalledWith('error', expect.any(Function));

        // Assert that the mockCallback function was called with the correct arguments.
        expect(mockCallback).toHaveBeenCalledTimes(3);
        expect(mockCallback).toHaveBeenCalledWith({ channelId, data: 5 });
        expect(mockCallback).toHaveBeenCalledWith({ channelId, data: 10 });
        expect(mockCallback).toHaveBeenCalledWith({ channelId, resolver: { end: expect.any(Function) } });

        // Assert that the Promise resolves without errors.
        await expect(streamPromise).resolves.not.toThrow();
    });

    it('handles JSON parsing errors and calls the callback with an error object', async () => {
        const mockStream = {
            on: jest.fn(),
        };
        const mockCallback = jest.fn((args: ChunkHandler) => {
            if (args.resolver?.error && args.error) args.resolver.error(args.error);
        });
        const channelId = 'channel1';
        const testData = 'data: {invalid JSON}';

        // Create a Promise that resolves after the "end" event is emitted.
        const streamPromise = new Promise<void>((resolve) => {
            mockStream.on.mockImplementation((eventName, listener) => {
                if (eventName === 'data') {
                    listener(Buffer.from(`${testData}\n\n`));
                }
                else if (eventName === 'end') {
                    listener();
                    resolve();
                }
            });
        });

        try {
            // Call the streamHandler function.
            await streamHandler(mockStream as unknown as IncomingMessage, channelId, mockCallback);
        }
        catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toMatch(/Unexpected token i in JSON at position 1/);
        }

        // Assert that the mockStream.on function was called with the correct arguments.
        expect(mockStream.on).toHaveBeenCalledTimes(3);
        expect(mockStream.on).toHaveBeenCalledWith('data', expect.any(Function));
        expect(mockStream.on).toHaveBeenCalledWith('end', expect.any(Function));
        expect(mockStream.on).toHaveBeenCalledWith('error', expect.any(Function));

        // Assert that the mockCallback function was called with the correct arguments.
        expect(mockCallback).toHaveBeenCalledTimes(2);
        expect(mockCallback).toHaveBeenCalledWith({
            channelId, resolver: {
                error: expect.any(Function),
            },
            error: expect.any(Error),
        });
        // this still gets called because the above error is caught in the data event.
        expect(mockCallback).toHaveBeenCalledWith({ channelId, resolver: { end: expect.any(Function) } });

        // Assert that the Promise resolves without errors.
        await expect(streamPromise).resolves.not.toThrow();
    });
});
