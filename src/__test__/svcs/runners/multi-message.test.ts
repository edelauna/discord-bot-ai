import { Attachment, Message } from 'discord.js';
import { multiMessage } from '../../../svcs/runners/multi-message';
import { send } from '../../../util/send';
import { getFileContent, isTextFile } from '../../../handlers/files';
import { singleMessage } from '../../../svcs/runners/single-message';
import { logger } from '../../../util/log';

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
    let message: Message;

    beforeEach(() => {
        // Create a mock message object for each test
        message = {
            channelId: '123',
            content: 'original message',
            attachments: new Map<string, Attachment>([
                ['1', { id: '1', url: 'https://example.com/file.txt', name: 'file.txt' } as Attachment],
            ]),
        } as unknown as Message;

        const sendMock = send as jest.MockedFunction<typeof send>;
        sendMock.mockResolvedValue();
    });

    afterEach(() => {
        // Clear all mock functions after each test
        jest.clearAllMocks();
    });

    it('sends a message to indicate that attachments are being analyzed', async () => {
        await multiMessage(message);
        expect(send).toHaveBeenCalledWith(
            '123', '||Noticed there were some attachments with your recent message. ' +
        'Will download and analyze the attachments based on the accompanying message.||',
        );
    });

    it('sends a message to indicate that an attachment is being downloaded', async () => {
        await multiMessage(message);
        expect(send).toHaveBeenCalledWith('123', 'Downloading file.txt...');
    });

    it('calls isTextFile and getFileContent for a text file attachment', async () => {
        await multiMessage(message);
        expect(isTextFile).toHaveBeenCalledWith('1', 'https://example.com/file.txt');
        expect(getFileContent).toHaveBeenCalledWith('1');
    });

    it('calls singleMessage with the combined message content for a text file attachment', async () => {
        await multiMessage(message);
        expect(singleMessage).toHaveBeenCalledWith({
            channelId: '123',

            content: 'original message\nfile content',
        });
    });

    it('logs a warning and sends an error message for a non-text file attachment', async () => {
        (isTextFile as jest.Mock).mockRejectedValue(new TypeError('reader is null'));
        await multiMessage(message);
        expect(logger.warn).toHaveBeenCalled();
        expect(send).toHaveBeenCalledWith(
            '123', expect.stringMatching(/^There was a problem with file\.txt:/),
        );
    });
});
