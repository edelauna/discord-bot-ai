import { Message } from 'discord.js';
import { multiplexorService } from '../../../svcs/runners/mux';
import { singleMessage } from '../../../svcs/runners/single-message';
import { multiMessage } from '../../../svcs/runners/multi-message';
import { runners } from '../../../svcs/runner';

jest.mock('../../../svcs/runners/single-message');
jest.mock('../../../svcs/runners/multi-message');

describe('multiplexorService', () => {
    let mockRunners: jest.MockedObject<typeof runners>;

    beforeEach(() => {
        mockRunners = runners as jest.MockedObject<typeof runners>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call singleMessage if message has no attachments', () => {
        mockRunners['ref-123'] = {
            status: 'running', message: {
                attachments: { size: 0 },
                content: 'The message',
            } as Message,
        };
        multiplexorService('ref-123');
        expect(singleMessage).toHaveBeenCalledWith({ content: 'The message', referenceId: 'ref-123' });
    });

    it('should call multiMessage if message has attachments', () => {
        mockRunners['ref-123'] = { status: 'running', message: { attachments: { size: 1 } } as Message };
        multiplexorService('ref-123');
        expect(multiMessage).toHaveBeenCalledWith('ref-123');
    });
});
