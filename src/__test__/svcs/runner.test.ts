import type { Message } from 'discord.js';
import { interactWithOpenAi, runners, updateRunners } from '../../svcs/runner';
import { logger } from '../../util/log';
import { send } from '../../util/send';
import { multiplexorService } from '../../svcs/runners/mux';
import { generateUuid } from '../../util/uuid';

// Mocks
jest.mock('../../util/send');
jest.mock('../../svcs/runners/mux');
jest.mock('../../util/log');
jest.mock('../../util/uuid');

describe('runner', () => {
    describe('interactWithOpenAi', () => {
        let mockMultiplexorService: jest.MockedFunction<typeof multiplexorService>;
        let mockGenerateUuid: jest.MockedFunction<typeof generateUuid>;
        beforeEach(() => {
            mockMultiplexorService = multiplexorService as jest.MockedFunction<typeof multiplexorService>;
            mockGenerateUuid = generateUuid as jest.MockedFunction<typeof generateUuid>;
        });

        afterEach(() => {
            jest.resetAllMocks();
        });
        it('calls multiplexorService with message', async () => {
            mockMultiplexorService.mockResolvedValue(undefined);
            mockGenerateUuid.mockReturnValue('mock-uuid');
            const message = { channelId: '123', channel: jest.fn(), content: 'hi' } as unknown as Message;
            await interactWithOpenAi(message);

            expect(generateUuid).toHaveBeenCalledTimes(1);
            expect(multiplexorService).toHaveBeenCalled();
            expect(multiplexorService).toHaveBeenCalledWith('mock-uuid');
        });

        it('logs and sends an error message when multiplexorService throws an error', async () => {
            const message = { channelId: '123', channel: jest.fn(), content: 'hi' } as unknown as Message;
            const error = new Error('Oops!');
            mockMultiplexorService.mockRejectedValue(error);
            const sendMock = send as jest.MockedFunction<typeof send>;
            sendMock.mockImplementation = jest.fn();
            mockGenerateUuid.mockReturnValue('mock-uuid');

            await interactWithOpenAi(message);

            expect(logger.error).toHaveBeenCalledWith('Oops!', expect.any(Object));
            expect(sendMock).toHaveBeenCalledWith('123', '||Error:Oops! processing referenceId: mock-uuid||');
        });
    });

    describe('updateRunners', () => {
        beforeEach(() => Object.keys(runners).forEach(k => delete runners[k]));

        it('sets status to running for runner with provided referenceId', () => {
            const message = {} as Message;
            updateRunners('start', message, '123');

            expect(runners['123']).toEqual({ status: 'running', message });
        });
        it('deletes runners', () => {
            const message = {} as Message;
            runners['123'] = { status: 'running', message };
            updateRunners('complete', message, '123');

            expect(runners['123']).toBeUndefined();
        });
        it('deletes aborted runners', () => {
            const message = {} as Message;
            runners['123'] = { status: 'aborted', message };
            updateRunners('complete', message, '123');

            expect(runners['123']).toBeUndefined();
        });
    });
});
