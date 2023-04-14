import { CommandInteraction } from 'discord.js';
import { resetMessages } from '../../../util/openai/messages';
import { execute } from '../../../handlers/commands/reset-messages';
import { getChannel } from '../../../config/db/channels';

jest.mock('../../../util/openai/messages');
jest.mock('../../../config/db/channels');

describe('execute function', () => {
    test('should call resetMessages function and reply to interaction', async () => {
        const interaction = {} as CommandInteraction;
        const resetMessagesMock = resetMessages as jest.MockedFunction<typeof resetMessages>;
        interaction.channelId = '12345';
        interaction.reply = jest.fn();
        (getChannel as jest.Mock).mockReturnValueOnce({ active: true, channel_id: '123' });

        await execute(interaction);

        expect(resetMessagesMock).toHaveBeenCalledWith('12345');
        expect(interaction.reply).toHaveBeenCalledWith('Chat history reset.');
    });
    test('should noop if channel is not found', async () => {
        const interaction = {} as CommandInteraction;
        interaction.channelId = '12345';
        interaction.reply = jest.fn();

        await execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith('-bot-ai not enabled in channel. See **/channel** command.');
    });
});
