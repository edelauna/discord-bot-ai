# Discord Bot AI

An interface between a Discord Server and OpenAi's ChatCompletions Api.

This is a meant to be an extension of Chat GPT into Discord, with a couple of customization features:

- Ability to activate `/channel` Discord Bot Ai in a [Channel](https://discord.com/developers/docs/resources/channel)


https://user-images.githubusercontent.com/54631123/231628908-c443ad80-679f-4a45-9506-5d9bf6ab73c3.mov


- Ability to set a custom system prompt `/instruct` within each channel.


https://user-images.githubusercontent.com/54631123/231630211-d402e36c-3b99-460e-815d-1b9e1d84ec3f.mov


- Ability to clear chat history `/reset-messages` with Discord Bot Ai.


https://user-images.githubusercontent.com/54631123/231630370-9a4d74a2-4f9e-49b8-990f-7d1e4fd5b899.mov


- Ability to upload file(s) and provide instructions for evaluating each file.


https://user-images.githubusercontent.com/54631123/231631342-dd806559-2217-49ad-9176-76dd945a1ba9.mov


- Ability to interrupt Discord Bot Ai


https://user-images.githubusercontent.com/54631123/231631632-cc9515e2-c285-4e55-a85b-0163aa74baac.mov


## Installation

### Pre-requisite

1. Create a Discord app
   - See [Building your first Discord App](https://discord.com/developers/docs/getting-started) for reference
   - Require `TOKEN`, `CLIENT_ID`, and `GUILD_ID`
2. Openai API Key
   - See [API Keys](https://platform.openai.com/account/api-keys)

### Getting Started

1. `npm i`
2. Create `.env` file at root of project with entries for:
   ```bash
   TOKEN=your-discord-token
   CLIENT_ID=your-discord-app-client-id
   GUILD_ID=the-discord-server-where-youve-invited-your-app
   OPENAI_API_KEY=your-openai-api-key
   ```
3. Create database via `npm run knex:migrate:latest`
4. Deploy slash commands to your server via `npm run deploy-commands`
5. Run app via `npm start`
