import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'discord-bot-ai' },
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880,
            maxFiles: 3,
            tailable: true,
        }),
        new winston.transports.File({
            filename: 'logs/development.log',
            maxsize: 5242880,
            maxFiles: 1,
            tailable: true,
        }),
        new winston.transports.Console({ format: winston.format.simple() }),
    ],
});

export { logger };
