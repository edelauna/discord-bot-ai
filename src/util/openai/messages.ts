import { encode } from 'gpt-3-encoder';
import { MessageTokenLengthExceeded } from '../../errors/messages';
import { DEFAULT_SYSTEM_MESSAGE } from '../../config/app';
import { Snowflake } from 'discord.js';
import { ReferenceId, runners } from '../../svcs/runner';
import { getChannels } from '../../config/db/channels';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// leaving 1/4 tokens for the reponse
const MAX_TOKENS = 32_768 / 4 * 3;

const messages: Record<Snowflake, Message[]> = {};
const systemMessages: Record<Snowflake, string> = {};
const tokens: Record<Snowflake, number> = {};

const recordMessage = (channelId: Snowflake, { content, role }: Message) => {
    const _messages = getMessages(channelId);
    const messageTokens = encode(content).length;
    confirmAvailableTokensForMessage(messageTokens, systemMessages[channelId]);
    trimMessages(messageTokens, _messages, channelId);

    tokens[channelId] += messageTokens;

    _messages.push({
        role: role,
        content: content,
    });
};

const getMessages = (channelId: Snowflake) => {
    const _messages = messages[channelId];
    if (_messages) { return _messages; }
    resetMessages(channelId);
    return messages[channelId];
};

const confirmAvailableTokensForMessage = (messageTokens: number, systemMessage: string) => {
    const systemTokens = encode(systemMessage).length;
    const allowedTokesn = MAX_TOKENS - systemTokens;
    if (messageTokens > allowedTokesn) {
        throw new MessageTokenLengthExceeded(
            `Provided message has ${messageTokens} tokens, this exceeds the maximum allowed of ${allowedTokesn}`);
    }
};

const trimMessages = (messageTokens: number, _messages: Message[], channelId: Snowflake) => {
    while (_messages.length > 1 && messageTokens > (MAX_TOKENS - tokens[channelId])) {
        const { content: firstOut } = _messages.splice(1, 1)[0];
        tokens[channelId] -= encode(firstOut).length;
    }
};

const endMessage = (referenceId: ReferenceId) => {
    const { channelId } = runners[referenceId].message;
    return `||Used ${tokens[channelId]} tokens. ReferenceId: ${referenceId}||`;
};

const resetMessages = (channelId: Snowflake) => {
    messages[channelId] = [];
    if (!systemMessages[channelId]) { systemMessages[channelId] = DEFAULT_SYSTEM_MESSAGE; }
    const systemTokens = encode(systemMessages[channelId]).length;
    messages[channelId].push({
        role: 'system',
        content: systemMessages[channelId],
    });
    tokens[channelId] = systemTokens;
};
const resetAllMessages = async () => {
    const channels = await getChannels();
    channels.map(channel => {
        const { channel_id, prompt } = channel;
        if (prompt) { systemMessages[channel_id] = prompt; }
        resetMessages(channel_id);
    });
};

const setSystemMessage = (channelId: Snowflake, prompt: string | null) => {
    if (!systemMessages[channelId] || !prompt) { return false; }
    const oldTokens = encode(systemMessages[channelId]).length;
    const newTokens = encode(prompt).length;
    systemMessages[channelId] = prompt;
    messages[channelId][0] = {
        role: 'system',
        content: prompt,
    };
    tokens[channelId] = newTokens - oldTokens;
    return true;
};

export { messages, recordMessage, resetMessages, endMessage, setSystemMessage, resetAllMessages };
export type { Message };

