import { TextBasedChannel } from 'discord.js';
import { channelMap, send, sendTyping, setSend, unsetSend } from '../../util/send';
import { SendError, SendTypingError } from '../../errors/send';

describe('channel functions', () => {
    beforeEach(() => {
        channelMap.clear();
    });
    test('setSend and unsetSend should add and remove channels from the channelMap', () => {
        const fakeChannel = { send: jest.fn(), sendTyping: jest.fn() };
        const channelId = '123';

        // Add the fake channel to the channelMap using setSend
        setSend({ channelId, channel: fakeChannel as unknown as TextBasedChannel });

        // Verify that the channel is in the channelMap
        expect(channelMap.get(channelId)).toBe(fakeChannel);

        // Remove the channel from the channelMap using unsetSend
        unsetSend(channelId);

        // Verify that the channel was removed from the channelMap
        expect(channelMap.get(channelId)).toBeUndefined();
    });

    test('send should call the send function of the channel with the specified channelId', async () => {
        const fakeChannel = { send: jest.fn() };
        const channelId = '456';
        const message = 'Hello, world!';

        // Add the fake channel to the channelMap using setSend
        setSend({ channelId, channel: fakeChannel as unknown as TextBasedChannel });

        // Call send with the channelId and message
        await send(channelId, message);

        // Verify that the send function of the channel was called with the message
        expect(fakeChannel.send).toHaveBeenCalledWith(message);
    });
    test('send should throw a SendError when no send function exists for the given channel', async () => {
        // Arrange
        const channelId = '12345';
        const messagePayload = { content: 'Hello, world!' };
        // Act and Assert
        await expect(send(channelId, messagePayload)).rejects.toThrow(SendError);
    });
    test('sendTyping should call the sendTyping function of the channel with the specified channelId', async () => {
        const fakeChannel = { sendTyping: jest.fn() };
        const channelId = '789';

        // Add the fake channel to the channelMap using setSend
        setSend({ channelId, channel: fakeChannel as unknown as TextBasedChannel });

        // Call sendTyping with the channelId
        await sendTyping(channelId);

        // Verify that the sendTyping function of the channel was called
        expect(fakeChannel.sendTyping).toHaveBeenCalled();
    });
    test('sendTyping should throw a SendTypingError when no sendTyping function exists for the given channel', async () => {
        // Arrange
        const channelId = '12345';

        // Act and Assert
        await expect(sendTyping(channelId)).rejects.toThrow(SendTypingError);
    });
});
