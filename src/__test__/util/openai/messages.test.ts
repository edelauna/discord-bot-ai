import { recordMessage, messages, resetMessages, Message, setSystemMessage } from '../../../util/openai/messages';
import fixtureMessage from './fixtures/messages.json';
import { MessageTokenLengthExceeded } from '../../../errors/messages';
import fs from 'fs';
import path from 'path';

describe('recordMessage', () => {
    const channelId = '123';
    beforeEach(() => {
        resetMessages(channelId);
    });

    it('adds message a system message on init', () => {
        const message = 'You are a helpful assistant that responds using markdown.';
        expect(messages[channelId]).toHaveLength(1);
        expect(messages[channelId][0].role).toBe('system');
        expect(messages[channelId][0].content).toBe(message);
    });

    it('adds message to messages array if token limit is not exceeded', () => {
        const message = 'This is a test message.';
        recordMessage(channelId, { content: message, role: 'user' });

        expect(messages[channelId]).toHaveLength(2);
        expect(messages[channelId][1].role).toBe('user');
        expect(messages[channelId][1].content).toBe(message);
    });

    it('throws an error if the message exceeds token limit', async () => {
        const filePath = path.join(__dirname, 'fixtures', 'large.txt');
        const longMessage = await fs.promises.readFile(filePath, 'utf-8');
        expect(() => {
            recordMessage(channelId, { content: longMessage, role: 'user' });
        }).toThrow(MessageTokenLengthExceeded);
    });

    it('removes oldest message when messages array exceeds token limit', () => {
        let i = 0;
        for (const message of fixtureMessage) {
            recordMessage(channelId, { content: message, role: (['user', 'assistant'][i++ % 2] as Message['role']) });
        }

        expect(messages[channelId]).toHaveLength(14);
        expect(messages[channelId]).not.toHaveLength(fixtureMessage.length);
        expect(messages[channelId][0].content).toBe('You are a helpful assistant that responds using markdown.');
        // short message was removed
        expect(messages[channelId][messages[channelId].length - 1].content).toBe(fixtureMessage[fixtureMessage.length - 1]);
    });

    it('resets messages array to include only the system message', () => {
        const message = 'This is a test message.';
        recordMessage(channelId, { content: message, role: 'user' });

        expect(messages[channelId]).toHaveLength(2);

        recordMessage(channelId, { content: 'Another message.', role: 'assistant' });
        expect(messages[channelId]).toHaveLength(3);

        recordMessage(channelId, { content: 'Yet another message.', role: 'user' });
        expect(messages[channelId]).toHaveLength(4);

        recordMessage(channelId, { content: 'And another message.', role: 'assistant' });
        expect(messages[channelId]).toHaveLength(5);

        resetMessages(channelId);

        expect(messages[channelId]).toHaveLength(1);
        expect(messages[channelId][0].content).toBe('You are a helpful assistant that responds using markdown.');
    });
});

describe('setSystemMessage', () => {
    let channelId = '123';
    beforeEach(() => {
        resetMessages(channelId);
    });
    it('should not set a system message if prompt is null', () => {
        const result = setSystemMessage(channelId, null);
        expect(result).toBe(false);
    });

    it('should not set a system message if channelId does not exist', () => {
        channelId = '99999';
        const prompt = 'new message';
        const result = setSystemMessage(channelId, prompt);
        expect(result).toBe(false);
    });

    it('should set a system message and update messages and tokens', () => {
        const prompt = 'new message';
        const result = setSystemMessage(channelId, prompt);
        expect(result).toBe(true);
    });
});
