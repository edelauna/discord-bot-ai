import { Events } from 'discord.js';
import type { Message } from 'discord.js';
import { client } from '../client';
import { interactWithOpenAi } from '../../svcs/runner';
import { getChannel } from '../db/channels';

module.exports = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        const channel = await getChannel(message.channelId);
        if (channel) {
            const { active } = channel;
            if (active && message.author.id !== client.user?.id) return interactWithOpenAi(message);
        }
    },
};
