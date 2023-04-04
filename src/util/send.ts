import type {
    MessageCreateOptions,
    MessagePayload,
    Snowflake,
    TextBasedChannel,
} from 'discord.js';
import { SendError, SendTypingError } from '../errors/send';

interface RegisterChannelSend {
    channelId: Snowflake;
    channel: TextBasedChannel;
}

const channelMap = new Map<Snowflake, TextBasedChannel>();

const setSend = ({ channelId, channel }: RegisterChannelSend) => channelMap.set(channelId, channel);

const unsetSend = (channelId: Snowflake) => channelMap.delete(channelId);

const send = async (channelId: Snowflake, options: string | MessagePayload | MessageCreateOptions) => {
    const channel = channelMap.get(channelId);
    if (channel) {
        await channel.send(options);
    }
    else {
        throw new SendError(`No send function found for channel ${channelId}`);
    }
};

const sendTyping = async (channelId: Snowflake) => {
    const channel = channelMap.get(channelId);
    if (channel) {
        await channel.sendTyping();
    }
    else {
        throw new SendTypingError(`No sendTyping function found for channel ${channelId}`);
    }
};

export { setSend, unsetSend, send, sendTyping, channelMap };
