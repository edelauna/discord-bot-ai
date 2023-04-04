import { Events } from 'discord.js';
import type { AppClient } from '../client';
import { logger } from '../../util/log';

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client: AppClient) {
        logger.info(`Ready! Logged in as ${client.user?.tag}`);
    },
};
