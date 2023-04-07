import { IncomingMessage } from 'http';
import { streamHandler } from '../../../handlers/openai/stream';
import { chunkHandler } from '../../../handlers/chunk';

jest.mock('../../../handlers/chunk');

describe('streamHandler', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('parses valid JSON data and calls the callback', async () => {
        const mockStream = {
            on: jest.fn(),
        };
        const mockCallback = chunkHandler as jest.MockedFunction<typeof chunkHandler>;
        mockCallback.mockResolvedValue(undefined);
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
        await streamHandler(mockStream as unknown as IncomingMessage, channelId);

        // Assert that the mockStream.on function was called with the correct arguments.
        expect(mockStream.on).toHaveBeenCalledTimes(3);
        expect(mockStream.on).toHaveBeenCalledWith('data', expect.any(Function));
        expect(mockStream.on).toHaveBeenCalledWith('end', expect.any(Function));
        expect(mockStream.on).toHaveBeenCalledWith('error', expect.any(Function));

        // Assert that the mockCallback function was called with the correct arguments.
        expect(mockCallback).toHaveBeenCalledTimes(3);
        expect(mockCallback).toHaveBeenCalledWith({ channelId, data: 5 });
        expect(mockCallback).toHaveBeenCalledWith({ channelId, data: 10 });
        expect(mockCallback).toHaveBeenCalledWith({ channelId, last: true });

        // Assert that the Promise resolves without errors.
        await expect(streamPromise).resolves.not.toThrow();
    });

    it('handles JSON parsing errors and calls the callback with an error object', async () => {
        const mockStream = {
            on: jest.fn(),
            emit: jest.fn(),
        };
        const mockCallback = chunkHandler as jest.MockedFunction<typeof chunkHandler>;
        mockCallback.mockResolvedValue();
        const channelId = 'channel1';
        const testData = 'data: {invalid JSON}';

        // Create a Promise that resolves after the "end" event is emitted.
        const streamPromise = new Promise<void>((resolve) => {
            let error: Error;
            mockStream.on.mockImplementation((eventName, listener) => {
                if (eventName === 'data') {
                    listener(Buffer.from(`${testData}\n\n`));
                }
                else if (eventName === 'error') {
                    listener(error);
                    resolve();
                }
            });
            mockStream.emit.mockImplementation((eventName, arg) => {
                if (eventName === 'error') {
                    error = arg;
                }
            });
        });

        try {
            // Call the streamHandler function.
            await streamHandler(mockStream as unknown as IncomingMessage, channelId);
        }
        catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toMatch(/Error with JSON.parse and data: {invalid JSON}./);
        }

        // Assert that the mockStream.on function was called with the correct arguments.
        expect(mockStream.on).toHaveBeenCalledTimes(3);
        expect(mockStream.on).toHaveBeenCalledWith('data', expect.any(Function));
        expect(mockStream.on).toHaveBeenCalledWith('end', expect.any(Function));
        expect(mockStream.on).toHaveBeenCalledWith('error', expect.any(Function));

        // Assert that the mockCallback function was called with the correct arguments.
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith({ channelId, last: true });

        // Assert that the Promise resolves without errors.
        await expect(streamPromise).resolves.not.toThrow();
    });
});
