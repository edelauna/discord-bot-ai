import { Models, openai } from '../../config/openai';
import { completionMessage } from '../../svcs/openai';
import { streamHandler } from '../../handlers/openai/stream';
import { runners } from '../../svcs/runner';
import type { Message } from 'discord.js';
import { messages } from '../../util/openai/messages';
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk } from 'openai/resources/chat';
import { getChannel } from '../../config/db/channels';

jest.mock('../../handlers/openai/stream');
jest.mock('../../util/openai/messages');
jest.mock('../../svcs/runner');
jest.mock('../../config/db/channels');

describe('completionMessage', () => {
    afterEach(() => jest.resetAllMocks());

    test('calls the provided callback with chat completions for OpenAI model', async () => {
        // Arrange
        const mockStream = jest.fn();
        const mockGetChannel = getChannel as jest.MockedFunction<typeof getChannel>;
        mockGetChannel.mockResolvedValue({ model: undefined, channel_id: '123', id: 1, active: true });

        const mockCreateChatCompletion = jest.spyOn(openai.chat.completions, 'create').mockResolvedValue(
            mockStream as unknown as Stream<ChatCompletionChunk>,
        );
        const mockStreamHandler = streamHandler as jest.MockedFunction<typeof streamHandler>;
        const mockRunners = runners as jest.MockedObject<typeof runners>;
        mockRunners['ref-123'] = { status: 'running', message: { channelId: '123' } as Message };

        const mockMessage = messages as jest.MockedObject<typeof messages>;
        mockMessage['123'] = [{
            'content': 'You are a helpful assistant that responds using markdown.',
            'role': 'system',
        }];

        // Act
        await completionMessage('ref-123');

        // Assert
        expect(mockCreateChatCompletion).toHaveBeenCalledWith({
            model: 'gpt-4o-mini',
            messages: [{

                'content': 'You are a helpful assistant that responds using markdown.',
                'role': 'system',
            }],
            stream: true,
        });
        expect(mockStreamHandler).toHaveBeenCalledWith(mockStream, 'ref-123');
        expect(openai.baseURL).toBe('https://api.openai.com/v1');
    });

    test('calls the provided callback with chat completions for Grok model', async () => {
        // Arrange
        const mockStream = jest.fn();
        const mockGetChannel = getChannel as jest.MockedFunction<typeof getChannel>;
        mockGetChannel.mockResolvedValue({ model: Models.GROK, channel_id: '123', id: 1, active: true });

        const mockCreateChatCompletion = jest.spyOn(openai.chat.completions, 'create').mockResolvedValue(
            mockStream as unknown as Stream<ChatCompletionChunk>,

        );
        const mockStreamHandler = streamHandler as jest.MockedFunction<typeof streamHandler>;
        const mockRunners = runners as jest.MockedObject<typeof runners>;
        mockRunners['ref-123'] = { status: 'running', message: { channelId: '123' } as Message };
        const mockMessage = messages as jest.MockedObject<typeof messages>;
        mockMessage['123'] = [{
            'content': 'You are a helpful assistant that responds using markdown.',

            'role': 'system',
        }];

        // Act
        await completionMessage('ref-123');

        // Assert
        expect(mockCreateChatCompletion).toHaveBeenCalledWith({
            model: 'grok-2-1212',
            messages: [{
                'content': 'You are a helpful assistant that responds using markdown.',
                'role': 'system',
            }],
            stream: true,
        });

        expect(mockStreamHandler).toHaveBeenCalledWith(mockStream, 'ref-123');
        expect(openai.baseURL).toBe('https://api.x.ai/v1');
    });

    test('does not call the provided callback when status aborted', async () => {
        // Arrange
        const mockStream = jest.fn();
        const mockResponse = {
            data: mockStream,
        };

        const mockGetChannel = getChannel as jest.MockedFunction<typeof getChannel>;
        mockGetChannel.mockResolvedValue({ model: undefined, channel_id: '123', id: 1, active: true });

        const mockCreateChatCompletion = jest.spyOn(openai.chat.completions, 'create').mockResolvedValue(
            mockResponse as unknown as Stream<ChatCompletionChunk>,
        );
        const mockStreamHandler = streamHandler as jest.MockedFunction<typeof streamHandler>;

        const mockRunners = runners as jest.MockedObject<typeof runners>;
        mockRunners['ref-123'] = { status: 'aborted', message: { channelId: '123' } as Message };
        const mockMessage = messages as jest.MockedObject<typeof messages>;
        mockMessage['123'] = [{
            'content': 'You are a helpful assistant that responds using markdown.',
            'role': 'system',
        }];

        // Act
        await completionMessage('ref-123');

        // Assert

        expect(mockCreateChatCompletion).toHaveBeenCalledWith({
            model: 'gpt-4o-mini',
            messages: [{
                'content': 'You are a helpful assistant that responds using markdown.',
                'role': 'system',
            }],
            stream: true,
        });
        expect(mockStreamHandler).toHaveBeenCalledTimes(0);
    });

    test('handles error when getting channel', async () => {
        // Arrange

        const mockGetChannel = getChannel as jest.MockedFunction<typeof getChannel>;
        mockGetChannel.mockRejectedValue(new Error('Channel not found'));

        // Act & Assert
        await expect(completionMessage('ref-123')).rejects.toThrow('Channel not found');
    });

    test('uses default model when channel model is unknown', async () => {
        // Arrange
        const mockStream = jest.fn();

        const mockGetChannel = getChannel as jest.MockedFunction<typeof getChannel>;
        mockGetChannel.mockResolvedValue({ model: 'unknown-model', channel_id: '123', id: 1, active: true });

        const mockCreateChatCompletion = jest.spyOn(openai.chat.completions, 'create').mockResolvedValue(
            mockStream as unknown as Stream<ChatCompletionChunk>,
        );
        const mockStreamHandler = streamHandler as jest.MockedFunction<typeof streamHandler>;

        const mockRunners = runners as jest.MockedObject<typeof runners>;
        mockRunners['ref-123'] = { status: 'running', message: { channelId: '123' } as Message };
        const mockMessage = messages as jest.MockedObject<typeof messages>;
        mockMessage['123'] = [{
            'content': 'You are a helpful assistant that responds using markdown.',
            'role': 'system',
        }];

        // Act
        await completionMessage('ref-123');

        // Assert

        expect(mockCreateChatCompletion).toHaveBeenCalledWith({
            model: 'gpt-4o-mini',
            messages: [{
                'content': 'You are a helpful assistant that responds using markdown.',
                'role': 'system',
            }],
            stream: true,
        });
        expect(mockStreamHandler).toHaveBeenCalledWith(mockStream, 'ref-123');
        expect(openai.baseURL).toBe('https://api.openai.com/v1');
    });
});
