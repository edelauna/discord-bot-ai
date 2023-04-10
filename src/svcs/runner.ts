import type { Message, Snowflake } from 'discord.js';
import { send, setSend } from '../util/send';
import { logger } from '../util/log';
import { multiplexorService } from './runners/mux';
import { generateUuid } from '../util/uuid';
/**
 * Enforce synchronous communication per channel.
 * Any new messages should cancel in-process requests.
*/
type ReferenceId = string;
interface Runner {
    message: Message;
    status: 'running' | 'aborted',
}
const runners: Record<ReferenceId, Runner> = {};
const running: Record<Snowflake, ReferenceId> = {};

const interactWithOpenAi = async (message: Message) => {
    const { channelId, channel } = message;
    const referenceId = generateUuid();
    try {
        updateRunners('start', message, referenceId);
        setSend({ channelId, channel });
        await multiplexorService(referenceId);
    }
    catch (error) {
        if (error instanceof Error) {
            send(channelId, `||Error:${error.message} processing referenceId: ${referenceId}||`);
            logger.error(error.message, { stack: error.stack, referenceId: referenceId });
        }
    }
    finally {
        updateRunners('complete', message, referenceId);
    }
};

const updateRunners = (action: 'start' | 'complete', message: Message, referenceId: ReferenceId) => {
    const { channelId } = message;
    const runningReferenceId = running[channelId];
    if (action == 'start') {
        if (runningReferenceId) { runners[runningReferenceId] = { ...runners[runningReferenceId], status: 'aborted' }; }
        // register new runner
        running[channelId] = referenceId;
        runners[referenceId] = { status: 'running', message: message };
        return;
    }
    if (runningReferenceId == referenceId) { delete running[channelId]; }
    delete runners[referenceId];
};

export { runners, interactWithOpenAi, ReferenceId, updateRunners };
