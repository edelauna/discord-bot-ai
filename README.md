# Discord Bot AI

An interface between a Discord Server and OpenAi's ChatCompletions Api.

This is a meant to be an extension of Chat GPT into Discord, with a couple of customization features:

- Ability to activate `/channel` Discord Bot Ai in a [Channel](https://discord.com/developers/docs/resources/channel)
- Ability to set a custom system prompt `/instruct` within each channel.
- Ability to clear chat history `/reset-messages` with Discord Bot Ai.
- Ability to upload file(s) and provide instructions for evaluating each file.
- Ability to interrupt Discord Bot Ai

## Installation

### Pre-requisite

1. Create a Discord app
   - See [Building your first Discord App](https://discord.com/developers/docs/getting-started) for reference
   - Require `TOKEN`, `CLIENT_ID`, and `GUILD_ID`
2. Openai API Key
   - See [API Keys](https://platform.openai.com/account/api-keys)

### Getting Started

0. `npm i`
1. Create `.env` file at root of project with entries for:
   ```bash
   TOKEN=your-discord-token
   CLIENT_ID=your-discord-app-client-id
   GUILD_ID=the-discord-server-where-youve-invited-your-app
   OPENAI_API_KEY=your-openai-api-key
   ```
2. Create database via `npm run knex:migrate:latest`
3. Deploy slash commands to your server via `npm run deploy-commands`
4. Run app via `npm start`
