import { DISCORD_MAX_CHARS } from '../config/app';

const updateLanguageModifier = (char: string, candidate: string, stack: Stack[]) => {
    const i = stack.length - 1;
    if (i < 0) return;

    if (candidate == '```') {
        stack[i].languageModifier = { active: true, v: candidate };
    }
    if (stack[i].languageModifier?.active && char.trim() === '') {
        stack[i].languageModifier.active = false;
    }
    if (stack[i].languageModifier?.active) {
        stack[i].languageModifier.v += char;
    }
};
/**
 * Updates the current candidate with the new formatting character or returns an empty string if it's not a valid format.
 * @param char The current character in the message being parsed.
 * @param candidate The current candidate string being built for formatting.
 * @param stack The current stack of nested formatting.
 * @returns The updated candidate string or an empty string.
 */
const updateFormattingCandidate = (i: number, char: string, candidate: string, stack: Stack[]) => {
    // TODO: figure out quotes
    const specialChars = ['*', '_', '~', '|', '`'];
    const specialCandidates = ['*', '**', '***', '_', '__', '~~', '||', '`', '```'];
    if (specialChars.includes(char)) {
        if (candidate === '' || candidate.includes(char)) {
            return candidate + char;
        }
    }
    else if (specialCandidates.includes(candidate)) {
        if (stack[stack.length - 1]?.value === candidate) {
            stack.pop();
        }
        else if (stack.length == 0) {
            // can't nest formatting once we found an open tag don't add another till closed.
            stack.push({ index: i, value: candidate, languageModifier: {} });
        }
    }
    updateLanguageModifier(char, candidate, stack);
    return '';
};

/**
 * Calculates the index at which to break a chunk into multiple chunks based on the current formatting stack and
 * the last new line or whitespace character in the chunk.
 * @param currentChunk The current chunk being parsed.
 * @param stack The current stack of nested formatting.
 * @param lastDefaultIndex The default index at which to break the chunk if there are no whitespace characters.
 * @returns The index at which to break the chunk.
 */
const calculateBreakIndex = (currentChunk: string, lastDefaultIndex: number): number => {
    const lastNewLine = currentChunk.lastIndexOf('\n');
    if (lastNewLine < 1) {
        // Check if there's a whitespace character we can break on.
        const lastWhitespace = currentChunk.search(/[\s]+(?=[^\s]*$)/);
        return lastWhitespace > 0 ? lastWhitespace : lastDefaultIndex;
    }
    return lastNewLine;
};

/**
 * Adds new formatting characters to the chunk being parsed.
 * @param currentChunk The current chunk being parsed.
 * @param stack The current stack of nested formatting.
 * @param filler The whitespace character to add between formatting characters.
 * @param breakIndex The index at which to break the chunk.
 * @returns An object containing the modified chunk and the updated break index.
 */
const addNewChars = (currentChunk: string, stack: Stack[], filler: string, breakIndex: number) => {
    let modifiedChunk = currentChunk;
    let updatedBreakIndex = breakIndex;
    if (stack.length > 0) {
        const { index: stackIndex, value: newChars, languageModifier } = stack[stack.length - 1];

        if (stackIndex < breakIndex) {
            const lMod = (languageModifier.v) ? languageModifier.v : newChars;
            // shifting whitespace character to between the newly added formatting chars
            modifiedChunk = `${currentChunk.slice(0, breakIndex)}${newChars}${filler}${lMod}${currentChunk.slice(breakIndex)}`;
            updatedBreakIndex = breakIndex + newChars.length;
        }
    }
    return { modifiedChunk, updatedBreakIndex };
};
/**
 * Breaks the current chunk being parsed into multiple chunks based on the current formatting stack and
 * the last new line or whitespace character in the chunk.
 * @param currentChunk The current chunk being parsed.
 * @param chunks An array of chunks.
 * @param stack The current stack of nested formatting.
 * @returns The modified chunk string.
 */
const breakChunk = (currentChunk: string, chunks: string[], stack: Stack[]) => {
    const lastDefaultIndex = DISCORD_MAX_CHARS;
    const breakIndex = calculateBreakIndex(currentChunk, lastDefaultIndex);

    // check whether we found a whitespace character to break on
    const filler = breakIndex === lastDefaultIndex ? '' : ' ';

    const { modifiedChunk, updatedBreakIndex } = addNewChars(currentChunk, stack, filler, breakIndex);

    const slicedChunk = modifiedChunk.slice(0, updatedBreakIndex);
    chunks.push(slicedChunk);
    return modifiedChunk.slice(updatedBreakIndex + filler.length);
};

/**
 * Safely split a message into multiple chunks that fit within Discord's maximum character limit.
 * @param message - The message to split.
 * @returns A FIFO array of strings, where each string represents a chunk of the original message that fits
 *          within Discord's maximum character limit.
 */
interface Stack {
    index: number,
    value: string,
    languageModifier: { active?: boolean, v?: string },
}
const safeChunk = (message: string): string[] => {
    const chunks: string[] = [];
    const stack: Stack[] = [];
    let currentChunk = '';
    let candidate = '';

    for (let i = 0; i < message.length; i++) {
        candidate = updateFormattingCandidate(i, message[i], candidate, stack);
        if (currentChunk.length >= DISCORD_MAX_CHARS) {
            currentChunk = breakChunk(currentChunk, chunks, stack);
        }
        currentChunk += message[i];
    }
    chunks.push(currentChunk);
    return chunks;
};

export { safeChunk };
