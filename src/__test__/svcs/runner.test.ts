import type { Message } from 'discord.js';
import { interactWithOpenAi, running, updateRunnerStatus } from '../../svcs/runner';
import { chunkHandler } from '../../handlers/chunk';
import { logger } from '../../util/log';
import { RunnerAlreadyFinishedError, RunnerAlreadyStartedError } from '../../errors/runner';
import { completionMessage } from '../../svcs/openai';
import { send } from '../../util/send';


// Mocks
jest.mock('../../util/send');
jest.mock('../../handlers/chunk');
jest.mock('../../util/log');
jest.mock('../../svcs/openai');

describe('runner', () => {
    beforeEach(() => {
        try {
            updateRunnerStatus('complete');
        }
        catch (err) {
            // do nothing
        }
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('interactWithOpenAi', () => {
        it('calls completionMessage with channelId and chunkHandler', async () => {
            const channel = { sendTyping: jest.fn() };

            const message = { channelId: '123', channel, content: 'hi' } as unknown as Message;
            const completionMessageMock = completionMessage as jest.MockedFunction<typeof completionMessage>;
            completionMessageMock.mockResolvedValue(undefined);
            await interactWithOpenAi(message);

            expect(completionMessageMock).toHaveBeenCalled();
            expect(completionMessageMock).toHaveBeenCalledWith('123', chunkHandler);
        });

        it('logs and sends an error message when completionMessage throws an error', async () => {

            const channel = { sendTyping: jest.fn() };
            const message = { channelId: '123', channel, content: 'hi' } as unknown as Message;
            const error = new Error('Oops!');
            const completionMessageMock = completionMessage as jest.MockedFunction<typeof completionMessage>;
            completionMessageMock.mockRejectedValue(error);
            const sendMock = send as jest.MockedFunction<typeof send>;
            sendMock.mockImplementation = jest.fn();

            await interactWithOpenAi(message);

            expect(logger.error).toHaveBeenCalledWith(error);

            expect(sendMock).toHaveBeenCalledWith('123', '__**[There was an error processing the request]**__');
        });
    });

    describe('updateRunnerStatus', () => {
        it('throws an error if called with "start" and running is true', async () => {
            updateRunnerStatus('start');
            // Ensure that the test assertions are called
            expect.assertions(2);
            try {
                await updateRunnerStatus('start');
            }
            catch (error) {
                expect(error).toBeInstanceOf(RunnerAlreadyStartedError);

                expect(error).toHaveProperty('message', 'Runner is currently activated.');
            }
        });

        it('sets running to true when called with "start"', async () => {
            await updateRunnerStatus('start');

            expect(running).toEqual(true);
        });

        it('throws an error if called with "complete" and running is false', async () => {
            // Ensure that the test assertions are called
            expect.assertions(2);
            try {
                await updateRunnerStatus('complete');
            }
            catch (error) {
                expect(error).toBeInstanceOf(RunnerAlreadyFinishedError);
                expect(error).toHaveProperty('message', 'Runner is currently not activated.');
            }
        });

        it('sets running to false when called with "complete" and running is true', async () => {
            await updateRunnerStatus('start');
            await updateRunnerStatus('complete');

            expect(running).toEqual(false);
        });
    });
});
