import { send, sendTyping } from '../../util/send';
import { singleMessage } from './single-message';
import { logger } from '../../util/log';
import { getFileContent, isTextFile } from '../../handlers/files';
import { ReferenceId, runners } from '../runner';

const multiMessage = async (referenceId: ReferenceId) => {
    const { message } = runners[referenceId];
    const { channelId, attachments } = message;
    await sendTyping(channelId);
    send(channelId,
        '||Noticed there were some attachments with your recent message. ' +
        'Will download and analyze the attachments based on the accompanying message.||')
        .then(() => sendTyping(channelId));
    const preText = message.content + '\n';
    for (const attachment of attachments.values()) {
        const { status } = runners[referenceId];
        if (status == 'aborted') { break; }
        send(channelId, `Downloading ${attachment.name}...`).then(() => sendTyping(channelId));
        try {
            const processable = await isTextFile(attachment.id, attachment.url);
            if (!processable) {
                send(channelId, `Unable to read: ${attachment.name}`);
                continue;
            }
            const content = await getFileContent(attachment.id);
            await singleMessage({ content: preText + content, referenceId });
        }
        catch (err) {
            send(channelId,
                `||There was a problem with ${attachment.name}:${(err as Error).message}\nReferenceId: ${referenceId}||`,
            ).then(() => sendTyping(channelId));
            logger.warn(`Problem with <${attachment.id},${attachment.name}>\n${err}`, { referenceId });
        }
    }
};

export { multiMessage };
