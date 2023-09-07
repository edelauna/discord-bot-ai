import { chunkHandler } from '../chunk';
import { ReferenceId, runners } from '../../svcs/runner';
import type { Stream } from 'openai/streaming';
import type { ChatCompletionChunk } from 'openai/resources/chat';

const streamHandler = async (
    stream: Stream<ChatCompletionChunk>,
    referenceId: ReferenceId,
) => {
    let aborted = false;
    for await (const part of stream) {
        const { status } = runners[referenceId];
        if (status == 'aborted') {
            await chunkHandler({ referenceId, last: true });
            stream.controller.abort();
            aborted = true;
            break;
        }
        await chunkHandler({ referenceId, data: part.choices[0].delta });
    }
    if (!aborted) await chunkHandler({ referenceId, last: true });
};

export { streamHandler };
