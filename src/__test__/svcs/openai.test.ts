import { AxiosResponse } from 'axios';
import { openai } from '../../config/openai';
import { completionMessage } from '../../svcs/openai';
import { streamHandler } from '../../handlers/openai/stream';

jest.mock('../../handlers/openai/stream');

describe('completionMessage', () => {
    test('calls the provided callback with chat completions', async () => {
        const mockStream = jest.fn();
        const mockResponse = {
            data: mockStream,
        };
        const mockCreateChatCompletion = jest.spyOn(openai, 'createChatCompletion').mockResolvedValue(
            mockResponse as unknown as AxiosResponse,
        );
        const mockStreamHandler = streamHandler as jest.MockedFunction<typeof streamHandler>;

        await completionMessage('channel1');

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
        expect(mockStreamHandler).toHaveBeenCalledWith(mockStream, 'channel1');
    });
});
