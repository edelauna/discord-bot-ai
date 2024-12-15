import { Models, openai } from '../config/openai';
import { messages } from '../util/openai/messages';
import { streamHandler } from '../handlers/openai/stream';
import { ReferenceId, runners } from './runner';
import { logger } from '../util/log';
import { getChannel } from '../config/db/channels';
import { openaiApiKey, xaiApiKey } from '../config/app';


const completionMessage = async (referenceId: ReferenceId) => {
    const { channelId } = runners[referenceId].message;
    const channel = await getChannel(channelId);
    let model;
    switch (channel?.model) {
    case Models.GROK:
        openai.apiKey = xaiApiKey;
        openai.baseURL = 'https://api.x.ai/v1';
        model = 'grok-2-1212';
        break;
    default:
        openai.apiKey = openaiApiKey;
        openai.baseURL = 'https://api.openai.com/v1';
        model = 'gpt-4o-mini';
    }
    const startTime = Date.now();
    const stream = await openai.chat.completions.create({
        model,
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
