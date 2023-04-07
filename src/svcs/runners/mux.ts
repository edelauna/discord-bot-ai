import type { Message } from 'discord.js';
import { singleMessage } from './single-message';
import { multiMessage } from './multi-message';

const multiplexorService = (message: Message) => {
    // todo interrupt
    if (message.attachments.size > 0) { return multiMessage(message); }
    else { return singleMessage(message); }
};

export { multiplexorService };
