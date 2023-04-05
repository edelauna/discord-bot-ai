import type { Client } from 'discord.js';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const registerEventHandlers = async (client: Client) => {
    const eventsPath = path.join(__dirname, './events');
    const dirEntries = await fs.readdir(eventsPath, { withFileTypes: true });

    const promises = [];
    for (const dirEntry of dirEntries) {
        if (dirEntry.isFile() && dirEntry.name.match(/\.ts$|\.js$/)) {
            const event = await import(path.join(eventsPath, dirEntry.name));
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            }
            else {
                client.on(event.name, (...args) => event.execute(...args));
            }
            promises.push(event);
        }
    }
    await Promise.all(promises);
};

export { registerEventHandlers };
