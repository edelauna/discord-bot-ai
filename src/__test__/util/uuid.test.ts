import { generateUuid } from '../../util/uuid';

describe('generateUuid', () => {
    test('returns a string in UUID format', () => {
        const regex = /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/;
        const uuid = generateUuid();
        expect(uuid).toMatch(regex);
    });
});
