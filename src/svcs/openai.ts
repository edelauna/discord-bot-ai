import { openai } from '../config/openai';
import { messages } from '../util/openai/messages';
import { streamHandler } from '../handlers/openai/stream';
import { ReferenceId, runners } from './runner';
import { logger } from '../util/log';


const completionMessage = async (referenceId: ReferenceId) => {
    const { channelId } = runners[referenceId].message;
    const startTime = Date.now();
    const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages[channelId],
        stream: true,
    });
    const responseTime = Date.now() - startTime;
    // Sometimes this gets really slow... typically mornings EST.
    logger.info(
        `openai.chat.completions.create time until response.data stream:${((responseTime % 60000) / 1000).toFixed(1)}s, ${responseTime % 1000}ms`,
        { referenceId },
    );
    if (runners[referenceId].status == 'aborted') { return; }
    await streamHandler(stream, referenceId);
};

export { completionMessage };
