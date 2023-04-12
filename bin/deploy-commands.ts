import { REST, Routes } from 'discord.js';
import { clientId, guildId, token } from '../src/config/app';
import fs from 'node:fs';
import path from 'node:path';

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, '../src/config/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

// and deploy your commands!
(async () => {
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const command = await import(`../src/config/commands/${file}`);
        commands.push(command.data.toJSON());
    }

    // Construct and prepare an instance of the REST module
    const rest = new REST({ version: '10' }).setToken(token as string);
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId as string, guildId as string),
            { body: commands },
        );

        console.log(`Successfully reloaded ${(data as JSON[]).length} application (/) commands.`);
    }
    catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
