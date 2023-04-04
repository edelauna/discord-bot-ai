import { SlashCommandBuilder } from 'discord.js';
import type { CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Provides information about the server.'),
    async execute(interaction: CommandInteraction) {
        // interaction.guild is the object representing the Guild in which the command was run
        await interaction.reply(`This server is ${interaction?.guild?.name} and has ${interaction?.guild?.memberCount} members.`);
    },
};
