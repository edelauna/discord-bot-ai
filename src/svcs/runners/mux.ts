import { singleMessage } from './single-message';
import { multiMessage } from './multi-message';
import { ReferenceId, runners } from '../runner';

const multiplexorService = (referenceId: ReferenceId) => {
    const { message } = runners[referenceId];
    if (message.attachments.size > 0) { return multiMessage(referenceId); }
    else { return singleMessage({ referenceId, content: message.content }); }
};

export { multiplexorService };
