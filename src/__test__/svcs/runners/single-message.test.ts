import type { Message } from 'discord.js';
import { completionMessage } from '../../../svcs/openai';
import { runners } from '../../../svcs/runner';
import { singleMessage } from '../../../svcs/runners/single-message';
import { recordMessage } from '../../../util/openai/messages';
import { sendTyping } from '../../../util/send';


jest.mock('../../../util/send');
jest.mock('../../../svcs/openai');
jest.mock('../../../util/openai/messages');

describe('singleMessage', () => {

    it('should call the necessary functions with the correct arguments', async () => {
        const mockRunners = runners as jest.MockedObject<typeof runners>;
        const mockContent = 'hello';
        mockRunners['ref-123'] = { status: 'running', message: { content: mockContent, channelId: '123' } as Message };
        const sendTypingMock = sendTyping as jest.Mock;
        const completionMessageMock = completionMessage as jest.Mock;
        const recordMessageMock = recordMessage as jest.Mock;

        await singleMessage({ content: mockContent, referenceId: 'ref-123' });

        expect(sendTypingMock).toHaveBeenCalledWith(mockRunners['ref-123'].message.channelId);

        expect(recordMessageMock).toHaveBeenCalledWith({ content: mockContent, role: 'user' });
        expect(recordMessageMock).toHaveBeenCalledWith({ content: mockContent, role: 'user' });
        expect(completionMessageMock).toHaveBeenCalledWith('ref-123');
    });
});
