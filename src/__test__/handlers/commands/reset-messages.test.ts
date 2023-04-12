import { CommandInteraction } from 'discord.js';
import { resetMessages } from '../../../util/openai/messages';
import { execute } from '../../../handlers/commands/reset-messages';

jest.mock('../../../util/openai/messages');

describe('execute function', () => {
    test('should call resetMessages function and reply to interaction', async () => {
        const interaction = {} as CommandInteraction;
        const resetMessagesMock = resetMessages as jest.MockedFunction<typeof resetMessages>;
        interaction.channelId = '12345';
        interaction.reply = jest.fn();

        await execute(interaction);

        expect(resetMessagesMock).toHaveBeenCalledWith('12345');
        expect(interaction.reply).toHaveBeenCalledWith('Chat history reset.');
    });
});
