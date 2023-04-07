import { completionMessage } from '../../../svcs/openai';
import { singleMessage } from '../../../svcs/runners/single-message';
import { recordMessage } from '../../../util/openai/messages';
import { sendTyping } from '../../../util/send';


jest.mock('../../../util/send');
jest.mock('../../../svcs/openai');
jest.mock('../../../util/openai/messages');

describe('singleMessage', () => {

    it('should call the necessary functions with the correct arguments', async () => {
        const message = { content: 'hello', channelId: '123' };
        const sendTypingMock = sendTyping as jest.Mock;
        const completionMessageMock = completionMessage as jest.Mock;
        const recordMessageMock = recordMessage as jest.Mock;

        await singleMessage(message);

        expect(sendTypingMock).toHaveBeenCalledWith(message.channelId);

        expect(recordMessageMock).toHaveBeenCalledWith({ content: message.content, role: 'user' });
        expect(completionMessageMock).toHaveBeenCalledWith(message.channelId);
    });
});
