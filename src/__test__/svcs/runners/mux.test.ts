import { Message } from 'discord.js';
import { multiplexorService } from '../../../svcs/runners/mux';
import { singleMessage } from '../../../svcs/runners/single-message';
import { multiMessage } from '../../../svcs/runners/multi-message';

jest.mock('../../../svcs/runners/single-message');
jest.mock('../../../svcs/runners/multi-message');

describe('multiplexorService', () => {
    let message: jest.Mocked<Message>;

    beforeEach(() => {
        message = {
            attachments: {
                size: 0,
            },
        } as jest.Mocked<Message>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call singleMessage if message has no attachments', () => {
        multiplexorService(message);
        expect(singleMessage).toHaveBeenCalledWith(message);
    });

    it('should call multiMessage if message has attachments', () => {
        Object.defineProperty(message.attachments, 'size', { value: 1 });
        multiplexorService(message);
        expect(multiMessage).toHaveBeenCalledWith(message);
    });
});
