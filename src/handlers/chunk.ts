import { DISCORD_MAX_CHARS } from '../config/app';
import { safeChunk } from '../util/chunk';
import { send, sendTyping } from '../util/send';
import { messageHandler } from './openai/message';
import { endMessage } from '../util/openai/messages';
import { ReferenceId, runners } from '../svcs/runner';
import { ChatCompletionChunk } from 'openai/resources/chat';

interface ChunkHandler {
    // want to limit interactions to one channel at a time
    referenceId: ReferenceId,
    last?: boolean,
    data?: ChatCompletionChunk.Choice.Delta
}

const activeChunks = new Map<ReferenceId, string>();

const chunkHandler = async ({ referenceId, data, last }: ChunkHandler) => {
    if (last) return handleLastChunk(referenceId);

    const newChunk = data?.content || '';
    const draftChunk = !activeChunks.has(referenceId) ? newChunk : activeChunks.get(referenceId) + newChunk;
    const finalChunk = handleChunk(referenceId, draftChunk);
    activeChunks.set(referenceId, finalChunk);
};

const handleChunk = (referenceId: ReferenceId, chunk: string) => {
    const { channelId } = runners[referenceId].message;
    const chunks = chunk.length > DISCORD_MAX_CHARS ? safeChunk(chunk) : [chunk];
    while (chunks.length > 1) {
        // there should always be one record due to while condition
        const content = chunks.shift() as string;
        // need to callback openai messageHandler to eventually store the response
        messageHandler({ referenceId, chunk: content });
        // important that this is a non blocking call
        send(channelId, content).then(() => sendTyping(channelId));
    }
    return chunks[0];
};

const handleLastChunk = async (referenceId: ReferenceId) => {
    const { channelId } = runners[referenceId].message;
    const lastChunk = activeChunks.get(referenceId) || '';
    activeChunks.delete(referenceId);
    if (lastChunk == '') { return; }
    messageHandler({ referenceId, chunk: lastChunk, end: true });
    await send(channelId, lastChunk);
    await sendTyping(channelId);
    await send(channelId, endMessage(referenceId));
};

const clearActiveChunks = () => activeChunks.clear();

export { chunkHandler, ChunkHandler, clearActiveChunks };
