import path from 'path';
import { files, getFileContent, isTextFile } from '../../handlers/files';
import { promises as fs } from 'fs';
import { setTimeout } from 'timers/promises';

describe('files', () => {
    afterEach(() => {
        jest.resetAllMocks();
        Object.keys(files).forEach(k => delete files[k]);
    });

    describe('isTextFile', () => {
        it('should call fetch and return true for text files', async () => {
            const mockRead = jest.fn();
            const fileContent = await fs.readFile(path.join(__dirname, './fixtures/text.txt'));
            mockRead.mockResolvedValueOnce(Promise.resolve({ value: new Uint8Array(fileContent), done: false }));
            mockRead.mockResolvedValueOnce(Promise.resolve({ done: true }));
            global.fetch = jest.fn().mockImplementationOnce(() =>
                Promise.resolve({
                    body: {
                        getReader: () => ({
                            read: mockRead,
                        }),
                    },
                }),
            );

            const isText = await isTextFile('123', 'https://example.com/text-file.txt');
            expect(isText).toBe(true);

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/text-file.txt');
        });

        it('should return false for a non-text file', async () => {
            const fileContent = await fs.readFile(path.join(__dirname, './fixtures/image.png'));
            global.fetch = jest.fn().mockImplementationOnce(() =>
                Promise.resolve({
                    body: {
                        getReader: () => ({
                            read: () => Promise.resolve({ value: new Uint8Array(fileContent), done: false }),
                        }),
                    },
                }),
            );

            const isText = await isTextFile('123', 'https://example.com/non-text-file.jpg');
            expect(isText).toBe(false);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/non-text-file.jpg');
        });

        it('should not download the file if it already exists', async () => {
            global.fetch = jest.fn();

            files['123'] = { isText: true };
            const isText = await isTextFile('123', 'https://example.com/textfile.txt');
            expect(isText).toBe(true);
            expect(global.fetch).toHaveBeenCalledTimes(0);
        });

        it('should return false after the TTL has expired', async () => {
            files['123'] = { isText: null };
            const result = await isTextFile('123', 'https://example.com/textfile.txt', 3);
            expect(result).toBe(false);
        });
    });

    describe('getFileContent', () => {
        it('should return the content of a text file', async () => {
            files['123'] = { isText: true, content: 'Hello, world!' };
            const result = await getFileContent('123');
            expect(result).toBe('Hello, world!');
        });

        it('should return an empty string if the file does not exist', async () => {
            const result = await getFileContent('456');
            expect(result).toBe('');
        });

        it('should wait for the file to download before returning the content', async () => {
            const mockDownload = jest.fn().mockImplementation(() => new Promise<void>(resolve => {
                setTimeout(100, 'Hello, world!').then(val => {
                    files['123'].content = val;
                    resolve();
                });
            }));
            files['123'] = { isText: null, downloadPromise: mockDownload() };
            const promise = getFileContent('123');
            expect(files['123']?.content).not.toBeDefined();
            const result = await promise;

            expect(result).toBe('Hello, world!');
        });
    });
});
