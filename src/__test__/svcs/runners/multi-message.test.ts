import { Attachment, Message } from 'discord.js';
import { multiMessage } from '../../../svcs/runners/multi-message';
import { send } from '../../../util/send';
import { getFileContent, isTextFile } from '../../../handlers/files';
import { singleMessage } from '../../../svcs/runners/single-message';
import { logger } from '../../../util/log';
import { runners } from '../../../svcs/runner';

// Mock send and sendTyping functions
jest.mock('../../../util/send', () => ({
    send: jest.fn().mockResolvedValue('done'),
    sendTyping: jest.fn(),
}));

// Mock singleMessage function
jest.mock('../../../svcs/runners/single-message', () => ({
    singleMessage: jest.fn(),
}));

// Mock getFileContent and isTextFile functions
jest.mock('../../../handlers/files', () => ({
    getFileContent: jest.fn(() => 'file content'),
    isTextFile: jest.fn(() => true),
}));

// Mock logger.warn function
jest.mock('../../../util/log', () => ({
    logger: {
        warn: jest.fn(),
    },
}));

describe('multiMessage', () => {
    let mockRunners: jest.MockedObject<typeof runners>;
    beforeEach(() => {
        // Create a mock message object for each test
        mockRunners = runners as jest.MockedObject<typeof runners>;

        const sendMock = send as jest.MockedFunction<typeof send>;
        sendMock.mockResolvedValue();
    });

    afterEach(() => {
        // Clear all mock functions after each test
        jest.clearAllMocks();
    });

    it('sends a message to indicate that attachments are being analyzed', async () => {
        mockRunners['ref-123'] = {
            status: 'running',
            message: {
                channelId: '123',
                content: 'original message',
                attachments: new Map<string, Attachment>([
                    ['1', { id: '1', url: 'https://example.com/file.txt', name: 'file.txt' } as Attachment],
                ]),
            } as unknown as Message,
        };
        await multiMessage('ref-123');
        expect(send).toHaveBeenCalledWith(
            '123', '||Noticed there were some attachments with your recent message. ' +
        'Will download and analyze the attachments based on the accompanying message.||',
        );
        expect(send).toHaveBeenCalledWith('123', 'Downloading file.txt...');
        expect(isTextFile).toHaveBeenCalledWith('1', 'https://example.com/file.txt');
        expect(getFileContent).toHaveBeenCalledWith('1');
        expect(singleMessage).toHaveBeenCalledWith({
            referenceId: 'ref-123',
            content: 'original message\nfile content',
        });
    });
    it('skips unprocessable messages', async () => {
        mockRunners['ref-123'] = {
            status: 'running',
            message: {
                channelId: '123',
                content: 'original message',
                attachments: new Map<string, Attachment>([
                    ['1', { id: '1', url: 'https://example.com/file.txt', name: 'file.txt' } as Attachment],
                ]),
            } as Message,
        };
        (isTextFile as jest.Mock).mockResolvedValue(false);
        await multiMessage('ref-123');
        expect(send).toHaveBeenCalledWith(
            '123', '||Noticed there were some attachments with your recent message. ' +
        'Will download and analyze the attachments based on the accompanying message.||',
        );
        expect(send).toHaveBeenCalledWith('123', 'Downloading file.txt...');
        expect(isTextFile).toHaveBeenCalledWith('1', 'https://example.com/file.txt');
        expect(getFileContent).toHaveBeenCalledTimes(0);
        expect(singleMessage).toHaveBeenCalledTimes(0);
    });
    it('breaks the loop if aborted', async () => {
        mockRunners['ref-123'] = {
            status: 'aborted',
            message: {
                channelId: '123',
                content: 'original message',
                attachments: new Map<string, Attachment>([
                    ['1', { id: '1', url: 'https://example.com/file.txt', name: 'file.txt' } as Attachment],
                ]),
            } as Message,
        };
        await multiMessage('ref-123');
        expect(send).toHaveBeenCalledWith(
            '123', '||Noticed there were some attachments with your recent message. ' +
        'Will download and analyze the attachments based on the accompanying message.||',
        );
        expect(isTextFile).toHaveBeenCalledTimes(0);
        expect(getFileContent).toHaveBeenCalledTimes(0);
        expect(singleMessage).toHaveBeenCalledTimes(0);
    });
    it('logs a warning and sends an error message for a non-text file attachment', async () => {
        (isTextFile as jest.Mock).mockRejectedValue(new TypeError('reader is null'));
        mockRunners['ref-123'] = {
            status: 'running',
            message: {
                channelId: '123',
                content: 'original message',
                attachments: new Map<string, Attachment>([
                    ['1', { id: '1', url: 'https://example.com/file.txt', name: 'file.txt' } as Attachment],
                ]),
            } as Message,
        };
        await multiMessage('ref-123');
        expect(logger.warn).toHaveBeenCalled();
        expect(send).toHaveBeenCalledWith(
            '123', '||There was a problem with file.txt:reader is null\nReferenceId: ref-123||',
        );
    });
});
