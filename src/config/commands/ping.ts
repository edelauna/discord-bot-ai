import { SlashCommandBuilder } from 'discord.js';
import type { CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    },
};
