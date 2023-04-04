import { encode } from 'gpt-3-encoder';
import { MessageTokenLengthExceeded } from '../../errors/messages';
import { DEFAULT_SYSTEM_MESSAGE } from '../../config/app';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// leaving 1/4 tokens for the reponse
const MAX_TOKENS = 4_096 / 4 * 3;

const messages: Message[] = [];
const systemMessage = DEFAULT_SYSTEM_MESSAGE;
const systemTokens = encode(systemMessage).length;
let tokens = systemTokens;

const recordMessage = ({ content, role }: Message) => {
    const messageTokens = encode(content).length;
    confirmAvailableTokensForMessage(messageTokens);
    trimMessages(messageTokens);

    tokens += messageTokens;
    messages.push({
        role: role,
        content: content,
    });
};

const confirmAvailableTokensForMessage = (messageTokens: number) => {
    const allowedTokesn = MAX_TOKENS - systemTokens;
    if (messageTokens > allowedTokesn) {
        throw new MessageTokenLengthExceeded(
            `Provided message has ${messageTokens} tokens, this exceeds the maximum allowed of ${allowedTokesn}`);
    }
};

const trimMessages = (messageTokens: number) => {
    while (messages.length > 1 && messageTokens > (MAX_TOKENS - tokens)) {
        const { content: firstOut } = messages.splice(1, 1)[0];
        tokens -= encode(firstOut).length;
    }
};

const endMessage = () => {
    return `||Used ${tokens} tokens||`;
};

const resetMessages = () => {
    messages.length = 0;
    messages.push({
        role: 'system',
        content: systemMessage,
    });
    tokens = systemTokens;
};

(async () => {
    resetMessages();
})();

export { messages, recordMessage, resetMessages, endMessage };
export type { Message };

