import { SlashCommandBuilder } from 'discord.js';
import { execute } from '../../handlers/commands/channel';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Enable or disable -bot-ai in this channel.')
        .addStringOption(option => option.setName('status')
            .setDescription('Enable or Disable -bot-ai')
            .setRequired(true)
            .addChoices(
                { name: 'Enable', value: 'enable' },
                { name: 'Disable', value: 'disable' },
                { name: 'Current Status', value: 'report' },
            )),
    execute,
};
