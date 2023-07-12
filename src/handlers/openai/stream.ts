import { IncomingMessage } from 'http';
import { chunkHandler } from '../chunk';
import { logger } from '../../util/log';
import { StreamDataError, StreamInterruptedError } from '../../errors/stream';
import { ReferenceId, runners } from '../../svcs/runner';

const streamHandler = (
    stream: IncomingMessage,
    referenceId: ReferenceId,
) => new Promise<void>((resolve, reject) => {
    stream.on('data', async (chunk: Buffer) => {
        const { status } = runners[referenceId];
        if (status == 'aborted') { return stream.destroy(new StreamInterruptedError('Stream aborted')); }
        const payload = chunk.toString();
        if (payload.startsWith('data:')) {
            // Messages in the event stream are separated by a pair of newline characters.
            // Have been receiving json data over multiple chunks, regex to squash multiline and remove [DONE]
            const data = payload.replaceAll(/((\n){2}|^)data:\s*(\[DONE\])?/g, '').trim();

            // empty data - assuming received `data: [DONE]` - finishing stream
            if (!data) return;
            try {
                const delta = JSON.parse(data);
                chunkHandler({ referenceId, data: delta.choices[0].delta });
            }
            catch (error) {
                const msg = `Error with JSON.parse and ${payload}.`;
                logger.error(`${msg}\n${error}`, { referenceId });
                stream.emit('error', new StreamDataError(msg, error as Error));
            }
        }
        // signalling to chunkHandler to finish via stream.on('end')
        // incase received `data: [DATA]` as part of multiline resposne
        if (payload.includes('[DONE]')) return;
    });
    stream.on('end', async () => {
        await chunkHandler({ referenceId, last: true });
        resolve();
    });
    stream.on('error', async (error: Error) => {
        await chunkHandler({ referenceId, last: true });
        if (error instanceof StreamInterruptedError) { resolve(); }
        else { reject(error); }
    });
});

export { streamHandler };
