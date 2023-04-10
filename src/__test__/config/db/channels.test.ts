import { db } from '../../../config/db';
import { Channel, getChannel, insertChannel, removeChannel, updateChannel } from '../../../config/db/channels';

describe('channels', () => {
    beforeAll(async () => {
        await db.migrate.latest();
    });

    afterAll(async () => {
        await db.destroy();
    });

    afterEach(async () => {
        await db('channels').delete();
    });

    describe('insertChannel', () => {
        beforeEach(async () => {
            await db('channels').delete();
        });
        it('inserts a new channel into the database', async () => {
            const channelId = '1234567890';
            const active = true;
            await insertChannel(channelId, active);

            const channels = await db<Channel>('channels').select();
            expect(channels).toHaveLength(1);
            expect(channels[0].channel_id).toEqual(channelId);
            expect(channels[0].active).toEqual(1);
        });
    });

    describe('updateChannel', () => {

        it('updates an existing channel', async () => {
            const channelId = '1234567890';
            await insertChannel(channelId, true);

            const newActive = false;
            await updateChannel(newActive, channelId);

            const channels = await db<Channel>('channels').select();
            expect(channels).toHaveLength(1);
            expect(channels[0].channel_id).toEqual(channelId);
            expect(channels[0].active).toEqual(0);
        });
    });

    describe('removeChannel', () => {

        it('removes an existing channel', async () => {
            const channelId = '1234567890';
            await insertChannel(channelId, true);

            await removeChannel(channelId);

            const channels = await db<Channel>('channels').select();
            expect(channels).toHaveLength(0);
        });
    });

    describe('getChannel', () => {
        it('returns the channel with the given id', async () => {
            const channelId = '1234567890';
            await insertChannel(channelId, true);

            const channel = await getChannel(channelId);

            expect(channel).toBeDefined();
            expect((channel as Channel).channel_id).toEqual(channelId);
            expect((channel as Channel).active).toEqual(1);
        });

        it('returns undefined if the channel does not exist', async () => {
            const channel = await getChannel('non-existent-id');

            expect(channel).toBeUndefined();
        });
    });
});
