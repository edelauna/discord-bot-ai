import { randomBytes } from 'crypto';

const generateUuid = (): string => {
    const data = randomBytes(16);

    // Set version (4) and variant bits as per the RFC.
    data[6] = (data[6] & 0x0f) | 0x40;
    data[8] = (data[8] & 0x3f) | 0x80;

    // Format the UUID string.
    const hex = Array.from(data).map((byte) => {
        return byte.toString(16).padStart(2, '0');
    });
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-` +
        `${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
};

export { generateUuid };
