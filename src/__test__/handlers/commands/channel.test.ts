import { CommandInteraction } from 'discord.js';
import { execute } from '../../../handlers/commands/channel';
import { getChannel, insertChannel } from '../../../config/db/channels';

jest.mock('../../../config/db/channels');
describe('execute', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });
    it('should return "This channel has -bot-ai enabled" if channel is active', async () => {
        const mockGetChannel = getChannel as jest.MockedFunction<typeof getChannel>;
        mockGetChannel.mockResolvedValue({ id: 1, channel_id: '123', active: true });
        const interaction = {
            options: {
                get: jest.fn().mockReturnValueOnce({ value: 'report' }),
            },
            channelId: '123',
            reply: jest.fn(),
        } as unknown as CommandInteraction;
        const mockReply = jest.spyOn(interaction, 'reply');
        await execute(interaction);
        expect(mockReply).toHaveBeenCalledWith('This channel has -bot-ai enabled');
    });

    it('should return "This channel has -bot-ai disabled" if channel is not active', async () => {
        const mockGetChannel = getChannel as jest.MockedFunction<typeof getChannel>;
        mockGetChannel.mockResolvedValue({ id: 1, channel_id: '123', active: false });
        const interaction = {
            options: {
                get: jest.fn().mockReturnValueOnce({ value: 'report' }),
            },
            channelId: '123',
            reply: jest.fn(),
        } as unknown as CommandInteraction;
        const mockReply = jest.spyOn(interaction, 'reply');
        await execute(interaction);
        expect(mockReply).toHaveBeenCalledWith('This channel has -bot-ai disabled');
    });

    it('should return "This channel has -bot-ai enabled" if status is enable', async () => {
        const mockGetChannel = getChannel as jest.MockedFunction<typeof getChannel>;
        mockGetChannel.mockResolvedValue({ id: 1, channel_id: '123', active: false });
        const interaction = {
            options: {
                get: jest.fn().mockReturnValueOnce({ value: 'enable' }),
            },
            channelId: '123',
            reply: jest.fn(),
        } as unknown as CommandInteraction;
        const mockReply = jest.spyOn(interaction, 'reply');
        await execute(interaction);
        expect(mockReply).toHaveBeenCalledWith('This channel has -bot-ai enabled');
    });

    it('should return "This channel has -bot-ai disabled" if status is disable', async () => {
        const mockGetChannel = getChannel as jest.MockedFunction<typeof getChannel>;
        mockGetChannel.mockResolvedValue({ id: 1, channel_id: '123', active: true });
        const interaction = {
            options: {
                get: jest.fn().mockReturnValueOnce({ value: 'disable' }),
            },
            channelId: '123',
            reply: jest.fn(),
        } as unknown as CommandInteraction;
        const mockReply = jest.spyOn(interaction, 'reply');
        await execute(interaction);
        expect(mockReply).toHaveBeenCalledWith('This channel has -bot-ai disabled');
    });

    it('should return "This channel has -bot-ai enabled" if channel is updated with status "enable"', async () => {
        const mockGetChannel = getChannel as jest.MockedFunction<typeof getChannel>;
        mockGetChannel.mockResolvedValue({ id: 1, channel_id: '123', active: true });
        const interaction = {
            options: {
                get: jest.fn().mockReturnValueOnce({ value: 'enable' }),
            },
            channelId: '123',
            reply: jest.fn(),
        } as unknown as CommandInteraction;
        const mockReply = jest.spyOn(interaction, 'reply');
        await execute(interaction);
        expect(mockReply).toHaveBeenCalledWith('This channel has -bot-ai enabled');
    });

    it('should return "This channel has -bot-ai disabled" if channel is updated with status "disable"', async () => {
        const mockGetChannel = getChannel as jest.MockedFunction<typeof getChannel>;
        mockGetChannel.mockResolvedValue({ id: 1, channel_id: '123', active: false });
        const interaction = {
            options: {
                get: jest.fn().mockReturnValueOnce({ value: 'disable' }),
            },
            channelId: '123',
            reply: jest.fn(),
        } as unknown as CommandInteraction;
        const mockReply = jest.spyOn(interaction, 'reply');
        await execute(interaction);
        expect(mockReply).toHaveBeenCalledWith('This channel has -bot-ai disabled');
    });

    it('should return "There was a problem updating the status" if there is an error thrown', async () => {
        const interaction = {
            options: {
                get: jest.fn().mockReturnValueOnce({ value: 'disable' }),
            },
            channelId: '123',
            reply: jest.fn(),
        } as unknown as CommandInteraction;
        // Mock throwing an error
        (insertChannel as jest.MockedFunction<typeof insertChannel>).mockRejectedValue(new Error('test'));
        const mockReply = jest.spyOn(interaction, 'reply');
        await execute(interaction);
        expect(mockReply).toHaveBeenCalledWith(
            expect.stringMatching(/^There was a problem updating the status\. ReferenceId.*/));
    });
});
