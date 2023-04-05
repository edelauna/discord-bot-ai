import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'discord-bot-ai' },
    transports: [
        new winston.transports.File({ filename: 'logs/development.log' }),
        new winston.transports.Console({ format: winston.format.simple() }),
    ],
});

export { logger };
