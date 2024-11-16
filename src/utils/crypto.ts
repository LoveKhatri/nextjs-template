if (!process.env.SALT) {
    throw new Error('Missing Environment Variable!!!\n- SALT');
}

const SALT = process.env.SALT;

export async function hashPassword(password: string) {
    const encoder = new TextEncoder();
    const encodedPassword = encoder.encode(password);
    const encodedSalt = encoder.encode(SALT);

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encodedPassword,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encodedSalt,
            iterations: 100000,
            hash: 'SHA-512',
        },
        keyMaterial,
        { name: 'HMAC', hash: 'SHA-512', length: 512 },
        true,
        ['sign']
    );

    const hashBuffer = await crypto.subtle.exportKey('raw', key);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

export async function verifyPassword(password: string, storedHash: string) {
    const hash = await hashPassword(password);
    return hash === storedHash;
}