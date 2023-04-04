import { IncomingMessage } from 'http';
import type { ChunkHandler } from '../chunk';
import { Snowflake } from 'discord.js';
import { logger } from '../../util/log';

const streamHandler = (
    stream: IncomingMessage,
    channelId: Snowflake,
    cb: (args: ChunkHandler) => string | void,
) => new Promise<void>((resolve, reject) => {
    stream.on('data', async (chunk: Buffer) => {
        // Messages in the event stream are separated by a pair of newline characters.
        const payloads = chunk.toString().split('\n\n');
        for (const payload of payloads) {
            // signalling to chunkHandler to finish via stream.on('end')
            if (payload.includes('[DONE]')) return;
            if (payload.startsWith('data:')) {
                // in case there's multiline data event
                const data = payload.replaceAll(/(\n)?^data:\s*/g, '');
                try {
                    const delta = JSON.parse(data.trim());
                    cb({ channelId, data: delta.choices[0].delta });
                }
                catch (error) {
                    logger.error(`Error with JSON.parse and ${payload}.\n${error}`);
                    cb({ channelId, resolver: { error: reject }, error: error as Error });
                }
            }
        }
    });
    stream.on('end', () => cb({ channelId, resolver: { end: resolve } }));
    stream.on('error', (error: Error) => cb({ channelId, resolver: { error: reject }, error }));
});

export { streamHandler };
