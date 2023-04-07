import { IncomingMessage } from 'node:http';
import { openai } from '../config/openai';
import { messages } from '../util/openai/messages';
import { streamHandler } from '../handlers/openai/stream';
import { Snowflake } from 'discord.js';


const completionMessage = async (channelId: Snowflake) => {
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messages,
        stream: true,
    }, { responseType: 'stream' });

    const stream = response.data as unknown as IncomingMessage;
    await streamHandler(stream, channelId);
};

export { completionMessage };
