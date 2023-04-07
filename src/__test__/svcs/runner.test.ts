import type { Message } from 'discord.js';
import { interactWithOpenAi, running, updateRunnerStatus } from '../../svcs/runner';
import { logger } from '../../util/log';
import { RunnerAlreadyFinishedError, RunnerAlreadyStartedError } from '../../errors/runner';
import { send } from '../../util/send';
import { multiplexorService } from '../../svcs/runners/mux';


// Mocks
jest.mock('../../util/send');
jest.mock('../../svcs/runners/mux');
jest.mock('../../util/log');
jest.mock('../../svcs/openai');

describe('runner', () => {
    let mockMultiplexorService: jest.MockedFunction<typeof multiplexorService>;
    beforeEach(() => {
        mockMultiplexorService = multiplexorService as jest.MockedFunction<typeof multiplexorService>;

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

    describe('multiplexorService', () => {
        it('calls multiplexorService with message', async () => {
            const message = { channelId: '123', channel: jest.fn(), content: 'hi' } as unknown as Message;
            mockMultiplexorService.mockResolvedValue(undefined);
            await mockMultiplexorService(message);

            expect(multiplexorService).toHaveBeenCalled();
            expect(multiplexorService).toHaveBeenCalledWith(message);
        });

        it('logs and sends an error message when multiplexorService throws an error', async () => {
            const message = { channelId: '123', channel: jest.fn(), content: 'hi' } as unknown as Message;
            const error = new Error('Oops!');
            mockMultiplexorService.mockRejectedValue(error);
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
