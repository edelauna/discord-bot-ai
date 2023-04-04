import { Events } from 'discord.js';
import type { Message } from 'discord.js';
import { client } from '../client';
import { interactWithOpenAi } from '../../svcs/runner';
import { logger } from '../../util/log';

module.exports = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        logger.info(`New message in channel ${message.channel}: ${message.content}`);
        if (message.author.id !== client.user?.id) return interactWithOpenAi(message);
    },
};
