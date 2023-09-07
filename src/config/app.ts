import dotenv from 'dotenv';

dotenv.config();

export const token = process.env.TOKEN;

export const clientId = process.env.CLIENT_ID;

export const guildId = process.env.GUILD_ID;

export const openaiApiKey = process.env.OPENAI_API_KEY || 'sk-placeholder';

export const environment = process.env.NODE_ENV || 'development';

// giving 6 char buffer to close out special formatting, and -1 for index.
export const DISCORD_MAX_CHARS = 500 - 7;

export const DEFAULT_SYSTEM_MESSAGE = 'You are a helpful assistant that responds using markdown.';
