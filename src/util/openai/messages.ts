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
const MAX_TOKENS = 4_096 / 4 * 3;

const messages: Record<Snowflake, Message[]> = {};
const systemMessage = DEFAULT_SYSTEM_MESSAGE;
const systemTokens = encode(systemMessage).length;
const tokens: Record<Snowflake, number> = {};

const recordMessage = (channelId: Snowflake, { content, role }: Message) => {
    const _messages = getMessages(channelId);
    setTokens(channelId);
    const messageTokens = encode(content).length;
    confirmAvailableTokensForMessage(messageTokens);
    trimMessages(messageTokens, _messages, channelId);

    tokens[channelId] += messageTokens;

    _messages.push({
        role: role,
        content: content,
    });
};

const setTokens = (channelId: Snowflake) => {
    const _tokens = tokens[channelId];
    if (_tokens) return;
    tokens[channelId] = systemTokens;
};

const getMessages = (channelId: Snowflake) => {
    const _messages = messages[channelId];
    if (_messages) { return _messages; }
    messages[channelId] = [];
    return messages[channelId];
};

const confirmAvailableTokensForMessage = (messageTokens: number) => {
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
    messages[channelId].push({
        role: 'system',
        content: systemMessage,
    });
    tokens[channelId] = systemTokens;
};
const resetAllMessages = async () => {
    const channels = await getChannels();
    channels.map(channel => {
        const { channel_id } = channel;
        resetMessages(channel_id);
    });
};

(async () => {
    /**
     * Requires a connection to the db - not available in
     * all tests when running test environment.
     */
    if (process.env.NODE_ENV !== 'test') { await resetAllMessages(); }
})();

export { messages, recordMessage, resetMessages, endMessage };
export type { Message };

