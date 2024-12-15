import { CommandInteraction } from 'discord.js';
import { getChannel, updateChannel } from '../../config/db/channels';
import { Models } from '../../config/openai';
import { generateUuid } from '../../util/uuid';
import { logger } from '../../util/log';

const execute = async (interaction: CommandInteraction) => {
    const model = interaction.options.get('model')?.value;
    const channel = await getChannel(interaction.channelId);
    let reply = '';
    try {
        if (!channel) { reply = 'This channel does not have -bot-ai enabled'; }
        else if (model == Models.OPEN_AI || model == Models.GROK) {
            await updateChannel(channel.channel_id, { ...channel, model });
            reply = `This channel is now using ${model}`;
        }
        else { reply = `This channel is using ${channel.model ? channel.model : Models.OPEN_AI}`; }

        await interaction.reply(reply);
    }
    catch (err) {
        const referenceId = generateUuid();
        logger.error((err as Error).message, { referenceId, stack: (err as Error).stack });
        await interaction.reply(`There was a problem updating the status. ReferenceId: ${referenceId}`);
    }
};

export { execute };
