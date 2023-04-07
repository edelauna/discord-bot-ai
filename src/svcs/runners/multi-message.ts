import type { Message } from 'discord.js';
import { send, sendTyping } from '../../util/send';
import { singleMessage } from './single-message';
import { logger } from '../../util/log';
import { getFileContent, isTextFile } from '../../handlers/files';
import { generateUuid } from '../../util/uuid';

const multiMessage = async (message: Message) => {
    await sendTyping(message.channelId);
    send(message.channelId,
        '||Noticed there were some attachments with your recent message. ' +
        'Will download and analyze the attachments based on the accompanying message.||')
        .then(() => sendTyping(message.channelId));
    const preText = message.content + '\n';
    for (const attachment of message.attachments.values()) {
        send(message.channelId, `Downloading ${attachment.name}...`).then(() => sendTyping(message.channelId));
        try {
            const processable = await isTextFile(attachment.id, attachment.url);
            if (!processable) { continue; }
            const content = await getFileContent(attachment.id);
            await singleMessage({ content: preText + content, channelId: message.channelId });
        }
        catch (err) {
            const referenceId = generateUuid();
            send(message.channelId,
                `There was a problem with ${attachment.name}:${(err as Error).message}\nReferenceId: ${referenceId}`,
            ).then(() => sendTyping(message.channelId));
            logger.warn(`Problem with <${attachment.id},${attachment.name}>\n${err}`, { referenceId });
        }
    }
};

export { multiMessage };
