import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type { CommandInteraction } from 'discord.js';

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

export { client, AppClient };
