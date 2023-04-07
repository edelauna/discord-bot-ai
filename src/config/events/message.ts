import { Events } from 'discord.js';
import type { Message } from 'discord.js';
import { client } from '../client';
import { interactWithOpenAi } from '../../svcs/runner';

module.exports = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        if (message.author.id !== client.user?.id) return interactWithOpenAi(message);
    },
};
