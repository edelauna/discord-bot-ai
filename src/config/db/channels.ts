import type { Snowflake } from 'discord.js';
import { db } from '../db';

interface Channel {
    id: number,
    channel_id: Snowflake,
    active: boolean,
}

const _db = () => db<Channel>('channels').clone();

const insertChannel = async (channelId: Snowflake, active: boolean) => {
    return await _db().insert({ channel_id: channelId, active });
};

const updateChannel = async (active: boolean, channelId: string) => {
    return await _db().where({ channel_id: channelId }).update({ active });
};

const removeChannel = async (channelId: Snowflake) => {
    return await _db().where({ channel_id: channelId }).del();
};

const getChannel = async (channelId: Snowflake) => {
    const rows = await _db().where({ channel_id: channelId });
    if (rows.length > 0) { return rows[0]; }
    return;
};

export { insertChannel, removeChannel, getChannel, updateChannel, Channel };
