import { token } from './config/app';
import { client } from './config/client';
import { registerCommandHandlers } from './config/commands';
import { registerEventHandlers } from './config/events';
import { logger } from './util/log';

const app = async () => {
    process.on('uncaughtException', (err) => {
        logger.error(`Uncaught Exception: ${err.message}`, err);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
        process.exit(1);
    });

    await registerCommandHandlers(client);
    await registerEventHandlers(client);
    await client.login(token);
};
app();

export { app };
