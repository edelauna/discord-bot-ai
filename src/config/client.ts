import { Client, Collection, GatewayIntentBits, Options } from 'discord.js';
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
    makeCache: Options.cacheWithLimits({
        // guild.commands
        ApplicationCommandManager: 0,
        // guild.emojis
        BaseGuildEmojiManager: 0,
        // client.channels
        // ChannelManager: 0,
        // guild.channels
        // GuildChannelManager: 0,
        // guild.bans
        GuildBanManager: 0,
        // guild.invites
        GuildInviteManager: 0,
        // guild.members
        GuildMemberManager: 0,
        // guild.stickers
        GuildStickerManager: 0,
        // guild.scheduledEvents
        GuildScheduledEventManager: 0,
        // channel.messages
        MessageManager: 0,
        // guild.presences
        PresenceManager: 0,
        // message.reactions
        ReactionManager: 0,
        // reaction.users
        ReactionUserManager: 0,
        // guild.stageInstances
        StageInstanceManager: 0,
        // channel.threads
        ThreadManager: 0,
        // threadchannel.members
        ThreadMemberManager: 0,
        // client.users
        UserManager: 0,
        // guild.voiceStates
        VoiceStateManager: 0,
    }),
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
    ],
}) as AppClient;

client.commands = new Collection();

export { client, AppClient };
