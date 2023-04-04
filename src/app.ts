import { token } from './config/app';
import { client } from './config/client';
import { registerEventHandlers } from './config/events';

registerEventHandlers(client);

client.login(token);
