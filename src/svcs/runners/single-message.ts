import { recordMessage } from '../../util/openai/messages';
import { completionMessage } from '../openai';
import { sendTyping } from '../../util/send';
import { ReferenceId, runners } from '../runner';

interface SingleMessage {
    content: string,
    referenceId: ReferenceId
}

const singleMessage = async ({ content, referenceId }: SingleMessage) => {
    sendTyping(runners[referenceId].message.channelId);
    recordMessage({ content, role: 'user' });
    await completionMessage(referenceId);
};

export { singleMessage };
