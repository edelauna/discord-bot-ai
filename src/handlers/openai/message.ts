import { recordMessage } from '../../util/openai/messages';
import { ReferenceId, runners } from '../../svcs/runner';

interface MessageHandler {
    referenceId: ReferenceId;
    chunk?: string;
    end?: boolean;
}

const activeMessages = new Map<ReferenceId, string>();

const messageHandler = ({ referenceId, chunk, end }: MessageHandler) => {
    const content = (activeMessages.get(referenceId) || '') + chunk;
    activeMessages.set(referenceId, content);
    if (end) {
        const { channelId } = runners[referenceId].message;
        recordMessage(channelId, { content, role: 'assistant' });
        activeMessages.delete(referenceId);
    }
};

export { messageHandler };
