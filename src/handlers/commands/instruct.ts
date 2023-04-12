import type { CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';
import { getChannel, updateChannel } from '../../config/db/channels';
import { generateUuid } from '../../util/uuid';
import { logger } from '../../util/log';
import { setSystemMessage } from '../../util/openai/messages';
import { DEFAULT_SYSTEM_MESSAGE } from '../../config/app';
import { UnableToSetSystemMessage } from '../../errors/messages';

const execute = async (interaction: CommandInteraction) => {
    const options = interaction.options as unknown as CommandInteractionOptionResolver;
    let reply = 'Not action performed.';
    try {
        const channel = await getChannel(interaction.channelId);
        if (!channel || !channel.active) { reply = '-bot-ai not enabled in channel. See **/channel** command.'; }
        else {
            const { channel_id, active } = channel;
            if (options.getSubcommand() === 'prompt') {
                const prompt = options.getString('prompt');
                await updateChannel(channel_id, { active, prompt });
                if (!setSystemMessage(channel_id, prompt)) {
                    throw new UnableToSetSystemMessage('setSystemMessage return false');
                }
                reply = 'System message updated to: ' + prompt;
            }
            else if (options.getSubcommand() === 'view') {
                const prompt = channel.prompt ?? DEFAULT_SYSTEM_MESSAGE;
                reply = 'System message is: ' + prompt;
            }
            else if (options.getSubcommand() === 'restore_default') {
                await updateChannel(channel_id, { active, prompt: null });
                if (!setSystemMessage(channel_id, DEFAULT_SYSTEM_MESSAGE)) {
                    throw new UnableToSetSystemMessage('setSystemMessage return false');
                }
                reply = 'System message updated to: ' + DEFAULT_SYSTEM_MESSAGE;
            }
        }
        await interaction.reply(reply);
    }
    catch (err) {
        const referenceId = generateUuid();
        logger.error((err as Error).message, { referenceId, stack: (err as Error).stack });
        await interaction.reply(`There was a problem updating the prompt. ReferenceId: ${referenceId}`);
    }
};

export { execute };
