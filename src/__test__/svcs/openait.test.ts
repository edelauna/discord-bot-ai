import { AxiosResponse } from 'axios';
import { openai } from '../../config/openai';
import { completionMessage } from '../../svcs/openai';

describe('completionMessage', () => {
    test('calls the provided callback with chat completions', async () => {
        const cb = jest.fn();
        const mockStream = {
            on: jest.fn(),
        };
        const testData = ['data: {"choices":[{"delta":5}]}', 'data: {"choices":[{"delta":10}]}', 'data: [DONE]'];
        mockStream.on.mockImplementation((eventName, listener) => {
            if (eventName === 'data') {
                for (const data of testData) {
                    listener(Buffer.from(`${data}\n\n`));
                }
            }
            else if (eventName === 'end') {
                listener();
            }
        });
        const mockResponse = {
            data: mockStream,
        };
        const mockCreateChatCompletion = jest.spyOn(openai, 'createChatCompletion').mockResolvedValue(
            mockResponse as unknown as AxiosResponse,
        );

        await completionMessage('channel1', cb);

        expect(mockCreateChatCompletion).toHaveBeenCalledWith({
            model: 'gpt-3.5-turbo',
            messages: [{
                'content': 'You are a helpful assistant that responds using markdown.',
                'role': 'system',
            }],
            stream: true,
        }, {
            responseType: 'stream',
        });
        expect(mockStream.on).toHaveBeenCalledWith('data', expect.any(Function));
        expect(mockStream.on).toHaveBeenCalledWith('end', expect.any(Function));
        expect(mockStream.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
});
