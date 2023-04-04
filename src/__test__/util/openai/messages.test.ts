import { recordMessage, messages, resetMessages, Message } from '../../../util/openai/messages';
import fixtureMessage from './fixtures/messages.json';
import { MessageTokenLengthExceeded } from '../../../errors/messages';
import fs from 'fs';
import path from 'path';

describe('recordMessage', () => {
    beforeEach(() => {
        resetMessages();
    });

    it('adds message a system message on init', () => {
        const message = 'You are a helpful assistant that responds using markdown.';
        expect(messages).toHaveLength(1);
        expect(messages[0].role).toBe('system');
        expect(messages[0].content).toBe(message);
    });

    it('adds message to messages array if token limit is not exceeded', () => {
        const message = 'This is a test message.';
        recordMessage({ content: message, role: 'user' });

        expect(messages).toHaveLength(2);
        expect(messages[1].role).toBe('user');
        expect(messages[1].content).toBe(message);
    });

    it('throws an error if the message exceeds token limit', async () => {
        const filePath = path.join(__dirname, 'fixtures', 'large.txt');
        const longMessage = await fs.promises.readFile(filePath, 'utf-8');
        expect(() => {
            recordMessage({ content: longMessage, role: 'user' });
        }).toThrow(MessageTokenLengthExceeded);
    });

    it('removes oldest message when messages array exceeds token limit', () => {
        let i = 0;
        for (const message of fixtureMessage) {
            recordMessage({ content: message, role: (['user', 'assistant'][i++ % 2] as Message['role']) });
        }

        expect(messages).toHaveLength(14);
        expect(messages).not.toHaveLength(fixtureMessage.length);
        expect(messages[0].content).toBe('You are a helpful assistant that responds using markdown.');
        // short message was removed
        expect(messages[messages.length - 1].content).toBe(fixtureMessage[fixtureMessage.length - 1]);
    });

    it('resets messages array to include only the system message', () => {
        const message = 'This is a test message.';
        recordMessage({ content: message, role: 'user' });

        expect(messages).toHaveLength(2);

        recordMessage({ content: 'Another message.', role: 'assistant' });
        expect(messages).toHaveLength(3);

        recordMessage({ content: 'Yet another message.', role: 'user' });
        expect(messages).toHaveLength(4);

        recordMessage({ content: 'And another message.', role: 'assistant' });
        expect(messages).toHaveLength(5);

        resetMessages();

        expect(messages).toHaveLength(1);
        expect(messages[0].content).toBe('You are a helpful assistant that responds using markdown.');
    });
});
