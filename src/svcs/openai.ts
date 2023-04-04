import { IncomingMessage } from 'node:http';
import { openai } from '../config/openai';
import { messages } from '../util/openai/messages';
import { streamHandler } from '../handlers/openai/chat-completions';
import { ChunkHandler } from '../handlers/chunk';
import { Snowflake } from 'discord.js';


const completionMessage = async (channelId: Snowflake, cb: (arg: ChunkHandler) => string | void) => {
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messages,
        stream: true,
    }, { responseType: 'stream' });

    const stream = response.data as unknown as IncomingMessage;
    streamHandler(stream, channelId, cb);
};

export { completionMessage };
