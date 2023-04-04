import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type { CommandInteraction } from 'discord.js';
import { logger } from '../util/log';

interface SlashCommand {
    name: string;
    description: string;
    execute: (interaction: CommandInteraction) => void;
}

interface AppClient extends Client {
    commands: Collection<string, SlashCommand>;
}
// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
    ],
}) as AppClient;

client.commands = new Collection();

const commandsPath = path.join(__dirname, './commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('ts'));
(async () => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        // Set a new item in the Collection with the key as teh command name and the values as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
        else {
            logger.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
})();

export { client, AppClient };
