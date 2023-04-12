import { CommandInteraction } from 'discord.js';
import { getChannel, updateChannel } from '../../../config/db/channels';
import { generateUuid } from '../../../util/uuid';
import { logger } from '../../../util/log';
import { execute } from '../../../handlers/commands/instruct';
import { setSystemMessage } from '../../../util/openai/messages';
import { DEFAULT_SYSTEM_MESSAGE } from '../../../config/app';

jest.mock('../../../config/db/channels');
jest.mock('../../../util/uuid');
jest.mock('../../../util/openai/messages');

describe('execute', () => {
    beforeEach(() => jest.resetAllMocks());
    it('should reply with an error message if there was a problem updating the prompt', async () => {
        const interaction = {
            options: {
                getSubcommand: jest.fn().mockReturnValueOnce('prompt'),
                getString: jest.fn().mockReturnValueOnce('some prompt'),
            },
            channelId: '123',
            reply: jest.fn(),
        } as unknown as CommandInteraction;
        const err = new Error('Something went wrong');
        const referenceId = '1234-5678';

        const loggerErrorSpy = jest.spyOn(logger, 'error');
        (getChannel as jest.Mock).mockReturnValueOnce({ active: true, channel_id: '123' });
        (updateChannel as jest.Mock).mockRejectedValueOnce(err);
        (generateUuid as jest.Mock).mockReturnValueOnce(referenceId);

        await execute(interaction);

        expect(updateChannel).toHaveBeenCalledWith(interaction.channelId, { active: expect.any(Boolean), prompt: expect.any(String) });
        expect(setSystemMessage).not.toHaveBeenCalled();

        expect(interaction.reply).toHaveBeenCalledWith(`There was a problem updating the prompt. ReferenceId: ${referenceId}`);
        expect(loggerErrorSpy).toHaveBeenCalledWith(err.message, { referenceId, stack: err.stack });
    });

    it('should reply with the updated system message after successfully updating a prompt', async () => {
        const interaction = {
            options: {
                getSubcommand: jest.fn().mockReturnValueOnce('prompt'),
                getString: jest.fn().mockReturnValueOnce('new prompt'),
            },
            channelId: '123',
            reply: jest.fn(),
        } as unknown as CommandInteraction;

        const mockChannel = { channel_id: interaction.channelId, active: true, prompt: 'Old prompt' };
        (getChannel as jest.Mock).mockResolvedValueOnce(mockChannel);
        const setSystemMessageMock = setSystemMessage as jest.Mock;
        const interactionReplySpy = jest.spyOn(interaction, 'reply');
        setSystemMessageMock.mockReturnValueOnce(true);

        await execute(interaction);

        expect(getChannel).toHaveBeenCalledWith(interaction.channelId);

        expect(updateChannel).toHaveBeenCalledWith(mockChannel.channel_id, { active: true, prompt: 'new prompt' });
        expect(setSystemMessageMock).toHaveBeenCalledWith(interaction.channelId, 'new prompt');
        expect(interactionReplySpy).toHaveBeenCalledWith('System message updated to: new prompt');
        interactionReplySpy.mockRestore();
    });
    it('should reply with the current system message when asked to view', async () => {
        const interaction = {
            options: {
                getSubcommand: jest.fn().mockReturnValue('view'),
            },
            channelId: '123',
            reply: jest.fn(),
        } as unknown as CommandInteraction;
        const mockChannel = { channel_id: interaction.channelId, active: true, prompt: 'Current prompt' };
        (getChannel as jest.Mock).mockResolvedValueOnce(mockChannel);
        const interactionReplySpy = jest.spyOn(interaction, 'reply');

        await execute(interaction);

        expect(getChannel).toHaveBeenCalledWith(interaction.channelId);

        expect(interactionReplySpy).toHaveBeenCalledWith('System message is: Current prompt');
        interactionReplySpy.mockRestore();
    });

    it('should restore the default system message and reply with it', async () => {
        const interaction = {
            options: {
                getSubcommand: jest.fn().mockReturnValue('restore_default'),
            },
            channelId: '123',
            reply: jest.fn(),
        } as unknown as CommandInteraction;
        const mockChannel = { channel_id: interaction.channelId, active: true, prompt: 'Old prompt' };
        (getChannel as jest.Mock).mockResolvedValueOnce(mockChannel);

        const setSystemMessageMock = setSystemMessage as jest.Mock;
        const interactionReplySpy = jest.spyOn(interaction, 'reply');
        setSystemMessageMock.mockReturnValueOnce(true);

        await execute(interaction);

        expect(getChannel).toHaveBeenCalledWith(interaction.channelId);
        expect(updateChannel).toHaveBeenCalledWith(mockChannel.channel_id, { active: true, prompt: null });

        expect(setSystemMessageMock).toHaveBeenCalledWith(interaction.channelId, DEFAULT_SYSTEM_MESSAGE);
        expect(interactionReplySpy).toHaveBeenCalledWith(`System message updated to: ${DEFAULT_SYSTEM_MESSAGE}`);
        interactionReplySpy.mockRestore();
    });
});
