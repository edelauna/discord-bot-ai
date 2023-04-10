import { IncomingMessage } from 'http';
import { chunkHandler } from '../chunk';
import { logger } from '../../util/log';
import { StreamDataError, StreamInterruptedError } from '../../errors/stream';
import { ReferenceId, runners } from '../../svcs/runner';

const streamHandler = (
    stream: IncomingMessage,
    referenceId: ReferenceId,
) => new Promise<void>((resolve, reject) => {
    const { channelId } = runners[referenceId].message;
    stream.on('data', async (chunk: Buffer) => {
        const { status } = runners[referenceId];
        if (status == 'aborted') { return stream.destroy(new StreamInterruptedError('Stream aborted')); }
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
                    chunkHandler({ channelId, data: delta.choices[0].delta });
                }
                catch (error) {
                    const msg = `Error with JSON.parse and ${payload}.`;
                    logger.error(`${msg}\n${error}`, { referenceId });
                    stream.emit('error', new StreamDataError(msg, error as Error));
                }
            }
        }
    });
    stream.on('end', async () => {
        await chunkHandler({ channelId, last: true });
        resolve();
    });
    stream.on('error', async (error: Error) => {
        await chunkHandler({ channelId, last: true });
        if (error instanceof StreamInterruptedError) { resolve(); }
        else { reject(error); }
    });
});

export { streamHandler };
