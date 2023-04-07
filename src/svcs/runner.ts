import { Message } from 'discord.js';
import { RunnerAlreadyFinishedError, RunnerAlreadyStartedError } from '../errors/runner';
import { send, setSend } from '../util/send';
import { logger } from '../util/log';
import { multiplexorService } from './runners/mux';

let running = false;

const interactWithOpenAi = async (message: Message) => {
    // calling complete in chunkHandler
    updateRunnerStatus('start');
    setSend({ channelId: message.channelId, channel: message.channel });
    try {
        await multiplexorService(message);
    }
    catch (error) {
        send(message.channelId, '__**[There was an error processing the request]**__');
        logger.error(error);
    }
    finally {
        await updateRunnerStatus('complete');
    }
};

const updateRunnerStatus = (action: 'start' | 'complete') => {
    if (action == 'start') {
        if (running == true) throw new RunnerAlreadyStartedError('Runner is currently activated.');
        running = true;
        return;
    }
    if (running == false) throw new RunnerAlreadyFinishedError('Runner is currently not activated.');

    running = false;
};

export { running, interactWithOpenAi, updateRunnerStatus };
