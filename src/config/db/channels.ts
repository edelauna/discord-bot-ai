import type { Snowflake } from 'discord.js';
import { db } from '../db';

interface Channel {
    id: number,
    channel_id: Snowflake,
    active: boolean,
    prompt?: string | null,
}

type PartialChannel = Omit<Channel, 'id' | 'channel_id'>;

const _db = () => db<Channel>('channels').clone();

const insertChannel = async (channelId: Snowflake, active: boolean) => {
    return await _db().insert({ channel_id: channelId, active });
};

const updateChannel = async (channelId: string, payload: PartialChannel) => {
    return await _db().where({ channel_id: channelId }).update(payload);
};

const removeChannel = async (channelId: Snowflake) => {
    return await _db().where({ channel_id: channelId }).del();
};

const getChannel = async (channelId: Snowflake) => {
    const rows = await _db().where({ channel_id: channelId });
    if (rows.length > 0) { return rows[0]; }
    return;
};

const getChannels = async () => {
    const rows = await _db().select();
    return rows;
};


export { insertChannel, removeChannel, getChannel, updateChannel, Channel, getChannels };
