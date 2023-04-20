import type { Snowflake } from 'discord.js';
import { setTimeout } from 'timers/promises';

interface File {
    isText: boolean | null,
    content?: string,
    downloadPromise?: Promise<void>
}
const files: Record<Snowflake, File> = {};

const downloadTextFile = async (attachmentId: Snowflake, url: string) => {
    const response = await fetch(url);
    if (!response.body) { return; }

    const reader = response.body.getReader();
    let partial = '';
    let isText = true;
    while (isText) {
        const { value, done } = await reader.read();
        if (done) { break; }
        const decoder = new TextDecoder('utf-8');
        const temp = decoder.decode(value.buffer);
        isText = /^[\p{L}\p{M}\p{N}\p{P}\p{Z}\p{S}\r\n\t]*$/u.test(temp);
        files[attachmentId] = { isText };
        partial = isText ? partial + temp : partial;
    }
    files[attachmentId] = { isText, content: partial };
};

const addFile = (attachmentId: Snowflake, url: string) =>
    files[attachmentId] = { isText: null, downloadPromise: downloadTextFile(attachmentId, url) };

const isTextFile = async (attachmentId: Snowflake, url: string, ttl = 6): Promise<boolean> => {
    if (!files[attachmentId]) { addFile(attachmentId, url); }
    if (files[attachmentId].isText !== null) { return files[attachmentId].isText as boolean; }
    let isText = null;
    while (isText == null && ttl > 0) {
        isText = await setTimeout(500, files[attachmentId]?.isText);
        ttl--;
    }
    return isText || false;
};

const getFileContent = async (attachmentId: Snowflake) => {
    if (!files[attachmentId]) { return ''; }
    await files[attachmentId].downloadPromise;
    return files[attachmentId].content;
};

export { isTextFile, getFileContent, files };
