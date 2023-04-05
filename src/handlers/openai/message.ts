import { Snowflake } from 'discord.js';
import { recordMessage } from '../../util/openai/messages';

interface MessageHandler {
    channelId: Snowflake;
    chunk?: string;
    end?: boolean;
}

const activeMessages = new Map<Snowflake, string>();

const messageHandler = ({ channelId, chunk, end }: MessageHandler) => {
    const content = (activeMessages.get(channelId) || '') + chunk;
    activeMessages.set(channelId, content);
    if (end) {
        recordMessage({ content, role: 'assistant' });
        activeMessages.delete(channelId);
    }
};

export { messageHandler };
