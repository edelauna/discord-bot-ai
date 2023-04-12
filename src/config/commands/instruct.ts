import { SlashCommandBuilder } from 'discord.js';
import { execute } from '../../handlers/commands/instruct';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('instruct')
        .setDescription('Update the system message used to gently instruct the assistant.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('prompt')
                .setDescription('Update the system message used to gently instruct the assistant.')
                .addStringOption(option => option
                    .setName('prompt')
                    .setDescription('The prompt to use.')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View the existing system message for this channel.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('restore_default')
                .setDescription('Restore the default system message for this channel.')),
    execute,
};
