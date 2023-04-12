import { token } from './config/app';
import { client } from './config/client';
import { registerCommandHandlers } from './config/commands';
import { db } from './config/db';
import { registerEventHandlers } from './config/events';
import { logger } from './util/log';
import { resetAllMessages } from './util/openai/messages';

const app = async () => {
    process.on('uncaughtException', (err) => {
        logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
        db.destroy();
        process.exit(1);
    });

    process.on('unhandledRejection', (err, promise) => {
        logger.error(`Unhandled Rejection at: ${promise}, reason: ${err}`, { stack: (err as Error).stack });
        db.destroy();
        process.exit(1);
    });

    await registerCommandHandlers(client);
    await registerEventHandlers(client);
    await resetAllMessages();
    await client.login(token);
};
app();

export { app };
