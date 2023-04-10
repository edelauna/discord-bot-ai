import type { CommandInteraction } from 'discord.js';
import { getChannel, insertChannel, updateChannel } from '../../config/db/channels';
import { generateUuid } from '../../util/uuid';
import { logger } from '../../util/log';

const execute = async (interaction: CommandInteraction) => {
    const status = interaction.options.get('status')?.value;
    const channel = await getChannel(interaction.channelId);
    let reply = '';
    try {
        if (status == 'enable' || status == 'disable') {
            const active = status == 'enable' ? true : false;
            if (channel) { await updateChannel(active, channel.channel_id); }
            else { await insertChannel(interaction.channelId, active); }
            reply = `This channel has -bot-ai ${status}d`;
        }
        else if (channel?.active) { reply = 'This channel has -bot-ai enabled'; }
        else { reply = 'This channel has -bot-ai disabled'; }

        await interaction.reply(reply);
    }
    catch (err) {
        const referenceId = generateUuid();
        logger.error((err as Error).message, { referenceId, stact: (err as Error).stack });
        await interaction.reply(`There was a problem updating the status. ReferenceId: ${referenceId}`);
    }
};

export { execute };
