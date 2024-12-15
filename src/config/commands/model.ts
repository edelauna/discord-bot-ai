import { SlashCommandBuilder } from 'discord.js';
import { Models } from '../openai';
import { execute } from '../../handlers/commands/model';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('model')
        .setDescription('Select the model for -bot-ai to use in this channel.')
        .addStringOption(option => option.setName('model')
            .setDescription('Select Model -bot-ai uses')
            .setRequired(true)
            .addChoices(
                { name: 'OpenAi', value: Models.OPEN_AI },
                { name: 'Grok', value: Models.GROK },
                { name: 'Current Status', value: 'report' },
            )),
    execute,
};
