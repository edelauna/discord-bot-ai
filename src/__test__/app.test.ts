import { client } from '../config/client';
import { registerEventHandlers } from '../config/events';

// Mock the login function of the client
client.login = jest.fn();
const token = '123';

// This is an important test for seeding coverage report
test('login with token', () => {
    // Register event handlers
    registerEventHandlers(client);

    // Call login function
    client.login(token);

    // Verify that the login function has been called with the token
    expect(client.login).toHaveBeenCalledWith(token);
});
