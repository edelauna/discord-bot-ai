import { SlashCommandBuilder } from 'discord.js';
import { execute } from '../../handlers/commands/reset-messages';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-messages')
        .setDescription('Clears chat history for current channel, leaving just the system prompt.'),
    execute,
};
