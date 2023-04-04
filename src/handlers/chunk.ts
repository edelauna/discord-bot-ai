import type { Snowflake } from 'discord.js';
import { DISCORD_MAX_CHARS } from '../config/app';
import { ChunkHandlerError } from '../errors/chunk';
import { safeChunk } from '../util/chunk';
import { send, sendTyping } from '../util/send';
import { messageHandler } from './openai/message';
import { endMessage } from '../util/openai/messages';

interface Resolver {
    end?: (value: void) => void;
    error?: (reason?: unknown) => void;
}

interface ChunkHandler {
    // want to limit interactions to one channel at a time
    channelId: Snowflake,
    resolver?: Resolver,
    data?: {
        role?: string
        content?: string
    },
    error?: Error
}

const activeChunks = new Map<Snowflake, string>();
/**
 * Pre-req: end == true, must be sent after the last data event.
 *
 * Receives incremental data, checks if we're over the character count,
 * if so - creates an array of safe chunks - sends all but the last item of the array.
 * On end - sends whatever is left - clears cache
 * @param ChunkHandle - attributes used for transforming messages from openai to discord format
 */
const chunkHandler = ({ channelId, resolver, data, error }: ChunkHandler) => {
    if (resolver) return handleLastChunk(channelId, resolver, error);

    const newChunk = data?.content || '';
    const draftChunk = !activeChunks.has(channelId) ? newChunk : activeChunks.get(channelId) + newChunk;
    const finalChunk = handleChunk(channelId, draftChunk);
    activeChunks.set(channelId, finalChunk);

    return finalChunk;
};

const handleChunk = (channelId: Snowflake, chunk: string) => {
    const chunks = chunk.length > DISCORD_MAX_CHARS ? safeChunk(chunk) : [chunk];
    while (chunks.length > 1) {
        // there should always be one record due to while condition
        const content = chunks.shift() as string;
        // need to callback openai messageHandler to eventually store the response
        messageHandler({ channelId, chunk: content });
        send(channelId, content).then(() => sendTyping(channelId));
    }
    return chunks[0];
};

const handleLastChunk = (channelId: Snowflake, resolver: Resolver, error?: Error) => {
    const lastChunk = activeChunks.get(channelId) || '';
    activeChunks.delete(channelId);
    messageHandler({ channelId, chunk: lastChunk, end: true });
    if (resolver.error) resolver.error(new ChunkHandlerError('Error while building chunk', error));
    send(channelId, lastChunk).then(() => {
        sendTyping(channelId).then(() => {
            send(channelId, endMessage()).then(() => {
                if (resolver.end) return resolver.end();
                if (!resolver.error) throw new ChunkHandlerError('No Resolver.end passed to handleLastChunk');
            });
        });
    });

    return lastChunk || '';
};

const clearActiveChunks = () => activeChunks.clear();

export { chunkHandler, ChunkHandler, clearActiveChunks };
