import { SlashCommandBuilder } from 'discord.js';
import type { CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .addStringOption(options =>
            options.setName('name')
                .setDescription('The name to pong.')
                .setRequired(true)),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong');
    },
};
