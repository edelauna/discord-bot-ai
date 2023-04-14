import type { CommandInteraction } from 'discord.js';
import { resetMessages } from '../../util/openai/messages';
import { getChannel } from '../../config/db/channels';

const execute = async (interaction: CommandInteraction) => {
    const channel = await getChannel(interaction.channelId);
    if (!channel || !channel.active) {
        return await interaction.reply('-bot-ai not enabled in channel. See **/channel** command.');
    }
    resetMessages(interaction.channelId);
    await interaction.reply('Chat history reset.');
};

export { execute };
