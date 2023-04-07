import type { Snowflake } from 'discord.js';
import { recordMessage } from '../../util/openai/messages';
import { completionMessage } from '../openai';
import { sendTyping } from '../../util/send';

interface SingleMessage {
    content: string,
    channelId: Snowflake
}

const singleMessage = async (message: SingleMessage) => {
    sendTyping(message.channelId);
    recordMessage({ content: message.content, role: 'user' });
    await completionMessage(message.channelId);
};

export { singleMessage };
