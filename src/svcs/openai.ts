import { IncomingMessage } from 'node:http';
import { openai } from '../config/openai';
import { messages } from '../util/openai/messages';
import { streamHandler } from '../handlers/openai/stream';
import { ReferenceId, runners } from './runner';
import { logger } from '../util/log';


const completionMessage = async (referenceId: ReferenceId) => {
    const { channelId } = runners[referenceId].message;
    const startTime = Date.now();
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo-16k',
        messages: messages[channelId],
        stream: true,
    }, { responseType: 'stream' });
    const responseTime = Date.now() - startTime;
    // Sometimes this gets really slow... typically mornings EST.
    logger.info(
        `openai.createChatCompletion time until response.data stream:${((responseTime % 60000) / 1000).toFixed(1)}s, ${responseTime % 1000}ms`,
        { referenceId },
    );
    if (runners[referenceId].status == 'aborted') { return; }
    const stream = response.data as unknown as IncomingMessage;
    await streamHandler(stream, referenceId);
};

export { completionMessage };
