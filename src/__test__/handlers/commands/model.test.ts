import { CommandInteraction } from 'discord.js';
import { getChannel, updateChannel } from '../../../config/db/channels';
import { Models } from '../../../config/openai';
import { logger } from '../../../util/log';
import { generateUuid } from '../../../util/uuid';
import { execute } from '../../../handlers/commands/model';

jest.mock('../../../config/db/channels');
jest.mock('../../../util/uuid');
jest.mock('../../../util/log');
jest.mock('../../../config/openai');

describe('execute', () => {
    let mockGetChannel: jest.MockedFunction<typeof getChannel>;
    let mockUpdateChannel: jest.MockedFunction<typeof updateChannel>;
    let mockGenerateUuid: jest.MockedFunction<typeof generateUuid>;
    let mockLoggerError: jest.MockedFunction<typeof logger.error>;

    beforeEach(() => {
        mockGetChannel = getChannel as jest.MockedFunction<typeof getChannel>;

        mockUpdateChannel = updateChannel as jest.MockedFunction<typeof updateChannel>;
        mockGenerateUuid = generateUuid as jest.MockedFunction<typeof generateUuid>;
        mockLoggerError = logger.error as jest.MockedFunction<typeof logger.error>;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should reply with "This channel does not have -bot-ai enabled" if channel does not exist', async () => {

        mockGetChannel.mockResolvedValue(undefined);
        const interaction = {
            channelId: '123',
            options: {
                get: jest.fn().mockReturnValue({ value: Models.OPEN_AI }),
            },
            reply: jest.fn(),
        } as unknown as CommandInteraction;

        await execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith('This channel does not have -bot-ai enabled');
    });

    it('should update channel and reply with model name if valid model is provided', async () => {
        const channel = { id: 1, channel_id: '123', model: Models.OPEN_AI, active: true };
        mockGetChannel.mockResolvedValue(channel);
        const interaction = {
            channelId: '123',
            options: {
                get: jest.fn().mockReturnValue({ value: Models.GROK }),
            },
            reply: jest.fn(),
        } as unknown as CommandInteraction;

        await execute(interaction);

        expect(mockUpdateChannel).toHaveBeenCalledWith('123', { ...channel, model: Models.GROK });
        expect(interaction.reply).toHaveBeenCalledWith(`This channel is now using ${Models.GROK}`);
    });

    it('should reply with current model if invalid model is provided', async () => {
        const channel = { id: 1, channel_id: '123', model: Models.OPEN_AI, active: true };
        mockGetChannel.mockResolvedValue(channel);

        const interaction = {
            channelId: '123',
            options: {
                get: jest.fn().mockReturnValue({ value: 'invalid-model' }),
            },
            reply: jest.fn(),
        } as unknown as CommandInteraction;

        await execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith(`This channel is using ${Models.OPEN_AI}`);
    });

    it('should reply with default model if no model is set for the channel', async () => {
        const channel = { id: 1, channel_id: '123', model: null, active: true };
        mockGetChannel.mockResolvedValue(channel);
        const interaction = {
            channelId: '123',
            options: {
                get: jest.fn().mockReturnValue({ value: 'invalid-model' }),
            },
            reply: jest.fn(),
        } as unknown as CommandInteraction;

        await execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith(`This channel is using ${Models.OPEN_AI}`);
    });

    it('should handle errors and log them', async () => {
        mockGetChannel.mockResolvedValue({ id: 1, channel_id: '123', model: Models.OPEN_AI, active: true });
        mockUpdateChannel.mockRejectedValue(new Error('Test error'));
        mockGenerateUuid.mockReturnValue('test-uuid');
        const interaction = {
            channelId: '123',

            options: {
                get: jest.fn().mockReturnValue({ value: Models.GROK }),
            },
            reply: jest.fn(),
        } as unknown as CommandInteraction;

        await execute(interaction);

        expect(mockLoggerError).toHaveBeenCalledWith('Test error', { referenceId: 'test-uuid', stack: expect.any(String) });
        expect(interaction.reply).toHaveBeenCalledWith('There was a problem updating the status. ReferenceId: test-uuid');
    });

});
