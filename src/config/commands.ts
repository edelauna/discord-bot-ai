import { promises as fs } from 'node:fs';
import path from 'node:path';
import { logger } from '../util/log';
import { AppClient } from './client';

const registerCommandHandlers = async (c: AppClient) => {
    const commandsPath = path.join(__dirname, './commands');
    const commandFiles = await fs.readdir(commandsPath, { withFileTypes: true });

    const promises = [];
    for (const dirEntry of commandFiles) {
        if (dirEntry.isFile() && dirEntry.name.match(/\.ts$|\.js$/)) {
            const command = await import(path.join(commandsPath, dirEntry.name));
            // Set a new item in the Collection with the key as teh command name and the values as the exported module
            if ('data' in command && 'execute' in command) {
                c.commands.set(command.data.name, command);
            }
            else {
                logger.warn(`[WARNING] The command at ${dirEntry.name} is missing a required "data" or "execute" property.`);
            }
            promises.push(command);
        }
    }
    await Promise.all(promises);
};

export { registerCommandHandlers };
