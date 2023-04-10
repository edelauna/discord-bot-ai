import type { Snowflake } from 'discord.js';
import { DISCORD_MAX_CHARS } from '../config/app';
import { safeChunk } from '../util/chunk';
import { send, sendTyping } from '../util/send';
import { messageHandler } from './openai/message';
import { endMessage } from '../util/openai/messages';

interface ChunkHandler {
    // want to limit interactions to one channel at a time
    channelId: Snowflake,
    last?: boolean,
    data?: {
        role?: string
        content?: string
    }
}

const activeChunks = new Map<Snowflake, string>();

const chunkHandler = async ({ channelId, data, last }: ChunkHandler) => {
    if (last) return handleLastChunk(channelId);

    const newChunk = data?.content || '';
    const draftChunk = !activeChunks.has(channelId) ? newChunk : activeChunks.get(channelId) + newChunk;
    const finalChunk = handleChunk(channelId, draftChunk);
    activeChunks.set(channelId, finalChunk);
};

const handleChunk = (channelId: Snowflake, chunk: string) => {
    const chunks = chunk.length > DISCORD_MAX_CHARS ? safeChunk(chunk) : [chunk];
    while (chunks.length > 1) {
        // there should always be one record due to while condition
        const content = chunks.shift() as string;
        // need to callback openai messageHandler to eventually store the response
        messageHandler({ channelId, chunk: content });
        // important that this is a non blocking call
        send(channelId, content).then(() => sendTyping(channelId));
    }
    return chunks[0];
};

const handleLastChunk = async (channelId: Snowflake) => {
    const lastChunk = activeChunks.get(channelId) || '';
    activeChunks.delete(channelId);
    if (lastChunk == '') { return; }
    messageHandler({ channelId, chunk: lastChunk, end: true });
    await send(channelId, lastChunk);
    await sendTyping(channelId);
    await send(channelId, endMessage());
};

const clearActiveChunks = () => activeChunks.clear();

export { chunkHandler, ChunkHandler, clearActiveChunks };
