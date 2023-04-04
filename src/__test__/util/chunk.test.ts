import { safeChunk } from '../../util/chunk';

describe('safeChunk', () => {
    it('returns an array of chunks split at the last white space character', () => {
        const message = 'This is a message that is longer than 2000 characters so it needs to be split into multiple chunks.\n' +
            'A'.repeat(1996);
        const chunks = safeChunk(message);
        expect(chunks).toHaveLength(6);
        expect(chunks[0]).toEqual(
            'This is a message that is longer than 2000 characters so it needs to be split into multiple chunks.',
        );
        expect(chunks[1]).toEqual('A'.repeat(493));
        expect(chunks[2]).toEqual('A'.repeat(493));
    });

    it('returns an array of chunks with special formatting characters added inbetween', () => {
        const message = 'This is a message that is longer than 2000 characters so it needs to be split into multiple chunks.\n' +
            '```js\n' + `${('A'.repeat(10) + ' ').repeat(10)} \n`.repeat(20) + '\n```';
        const chunks = safeChunk(message);
        expect(chunks).toHaveLength(6);
        expect(chunks[0]).toEqual(
            'This is a message that is longer than 2000 characters so it needs to be split into multiple chunks.\n' +
            '```js\n' + (`${('A'.repeat(10) + ' ').repeat(10)} \n`.repeat(3)).slice(0, -1) + '```',
        );
        expect(chunks[1]).toEqual(
            '```js\n' + (`${('A'.repeat(10) + ' ').repeat(10)} \n`.repeat(4)).slice(0, -1) + '```',
        );
    });

    it('handles formatting characters correctly', () => {
        const message = 'This message contains *bold*, _italic_, and `code` formatting.\n' +
            'This message contains ***bold and italic***, ~~strikethrough~~, and ||spoilers||.';
        const chunks = safeChunk(message);
        expect(chunks).toHaveLength(1);
        expect(chunks[0]).toEqual(
            'This message contains *bold*, _italic_, and `code` formatting.\n' +
            'This message contains ***bold and italic***, ~~strikethrough~~, and ||spoilers||.',
        );
    });
});
