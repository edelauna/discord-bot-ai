import { Events } from 'discord.js';
import type { Interaction } from 'discord.js';
import type { AppClient } from '../client';
import { logger } from '../../util/log';

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;
        const command = (interaction.client as AppClient).commands.get(interaction.commandName);

        if (!command) {
            logger.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        }
        catch (error) {
            logger.error(`Error executing ${interaction.commandName}`);
            logger.error(error);
        }
    },
};
