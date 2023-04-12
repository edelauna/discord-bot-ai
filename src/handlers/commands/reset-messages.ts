import type { CommandInteraction } from 'discord.js';
import { resetMessages } from '../../util/openai/messages';

const execute = async (interaction: CommandInteraction) => {
    resetMessages(interaction.channelId);
    await interaction.reply('Chat history reset.');
};

export { execute };
