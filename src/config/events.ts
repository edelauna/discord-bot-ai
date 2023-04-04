import type { Client } from 'discord.js';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const registerEventHandlers = async (client: Client) => {
    const eventsPath = path.join(__dirname, './events');
    const eventsFiles = readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

    for (const file of eventsFiles) {
        const filePath = path.join(eventsPath, file);
        const event = await import(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
};

export { registerEventHandlers };
