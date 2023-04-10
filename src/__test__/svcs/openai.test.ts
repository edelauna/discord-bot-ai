import { AxiosResponse } from 'axios';
import { openai } from '../../config/openai';
import { completionMessage } from '../../svcs/openai';
import { streamHandler } from '../../handlers/openai/stream';
import { runners } from '../../svcs/runner';
import type { Message } from 'discord.js';

jest.mock('../../handlers/openai/stream');

describe('completionMessage', () => {
    afterEach(() => jest.resetAllMocks());

    test('calls the provided callback with chat completions', async () => {
        const mockStream = jest.fn();
        const mockResponse = {
            data: mockStream,
        };
        const mockCreateChatCompletion = jest.spyOn(openai, 'createChatCompletion').mockResolvedValue(
            mockResponse as unknown as AxiosResponse,
        );
        const mockStreamHandler = streamHandler as jest.MockedFunction<typeof streamHandler>;
        const mockRunners = runners as jest.MockedObject<typeof runners>;
        mockRunners['ref-123'] = { status: 'running', message: {} as Message };
        await completionMessage('ref-123');

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
        expect(mockStreamHandler).toHaveBeenCalledWith(mockStream, 'ref-123');
    });
    test('does not call the provided callback when status aborted', async () => {
        const mockStream = jest.fn();
        const mockResponse = {
            data: mockStream,
        };
        const mockCreateChatCompletion = jest.spyOn(openai, 'createChatCompletion').mockResolvedValue(
            mockResponse as unknown as AxiosResponse,
        );
        const mockStreamHandler = streamHandler as jest.MockedFunction<typeof streamHandler>;
        const mockRunners = runners as jest.MockedObject<typeof runners>;
        mockRunners['ref-123'] = { status: 'aborted', message: {} as Message };
        await completionMessage('ref-123');

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
        expect(mockStreamHandler).toHaveBeenCalledTimes(0);
    });
});
