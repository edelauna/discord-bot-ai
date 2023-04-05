import { app } from '../app';
import { token } from '../config/app';
import { AppClient, client } from '../config/client';
import { registerCommandHandlers } from '../config/commands';
import { registerEventHandlers } from '../config/events';
import { logger } from '../util/log';

// Create mocks
jest.mock('../config/events', () => ({
    registerEventHandlers: jest.fn(),
}));
jest.mock('../config/commands', () => ({
    registerCommandHandlers: jest.fn(),
}));
jest.mock('../config/client', () => ({
    client: {
        login: jest.fn(),
    },
}));
// Create a test suite
describe('app', () => {

    // Create a test case
    it('registers event handlers and logs in', async () => {

        // Create a mock client instance
        const clientMock = client as jest.MockedObject<AppClient>;
        clientMock.login.mockResolvedValue('Fake token');

        // Call the app function
        await app();

        // Expect registerEventHandlers to have been called with the client instance
        expect(registerEventHandlers).toHaveBeenCalledWith(clientMock);
        expect(registerCommandHandlers).toHaveBeenCalledWith(clientMock);

        // Expect the client to have logged in
        expect(clientMock.login).toHaveBeenCalledWith(token);

    });

    // Create another test case
    it('logs errors and exits in case of uncaught exceptions or unhandled rejections', () => {

        // Create a mock logger function
        const loggerErrorSpy = jest.spyOn(logger, 'error');
        const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
            return code as never;
        });


        // Call the uncaughtException and unhandledRejection event handlers
        process.emit('uncaughtException', new Error('uncaught exception occurred'));
        process.emit('unhandledRejection', new Error('unhandled rejection occurred'), Promise.resolve());

        // Expect the error to have been logged twice
        expect(loggerErrorSpy).toHaveBeenCalledTimes(4);
        expect(processExitSpy).toHaveBeenCalledTimes(4);
    });
});
