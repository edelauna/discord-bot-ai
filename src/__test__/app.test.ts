import { app } from '../app';
import { client } from '../config/client';
import * as Commands from '../config/commands';
import * as Events from '../config/events';
import { logger } from '../util/log';

// Create mocks
jest.mock('../config/client');
// Create a test suite
describe('app', () => {

    // Create a test case
    it('registers event handlers and logs in', async () => {
        const registerEventHandlersSpy = jest.spyOn(Events, 'registerEventHandlers');
        const registerCommandHandlersSpy = jest.spyOn(Commands, 'registerCommandHandlers');
        // Call the app function
        await app();

        // Expect registerEventHandlers to have been called with the client instance
        expect(registerEventHandlersSpy).toHaveBeenCalledWith(client);
        expect(registerCommandHandlersSpy).toHaveBeenCalledWith(client);

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
