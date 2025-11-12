import { PrismaClient } from '../generated/prisma/index.js';
import { sign } from 'hono/jwt'

const prisma = new PrismaClient();

function base64Url(input: Uint8Array | string) {
    let bytes: Uint8Array;
    if (typeof input === 'string') {
        bytes = new TextEncoder().encode(input);
    } else {
        bytes = input;
    }
    const b64 = Buffer.from(bytes).toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmacSha256(key: Uint8Array, data: string) {
    // @ts-ignore - globalThis.crypto is available in Bun/Deno environments
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
    return new Uint8Array(sig);
}

export default class LoginService {
    async login(username: string, password: string): Promise<{ token: string } | null> {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) return null;

        const envUser = process.env.LOGIN_USERNAME;
        const envPass = process.env.LOGIN_PASSWORD;

        let subject: string | null = null;

        if (envUser && envPass) {
            if (username === envUser && password === envPass) {
                subject = `env:${envUser}`;
            } else {
                return null;
            }
        } else {
            try {
                const user = await prisma.user.findUnique({ where: { email: username } });
                if (!user) return null;
                subject = user.id;
            } catch (err) {
                return null;
            }
        }

        const payload = {
            sub: subject,
            exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
            alg: 'HS256'
        }

        const token = await sign(payload, jwtSecret);
        return { token };
    }

    // Optional local verification helper (not used by Hono jwt middleware but handy for tests)
    async verify(token: string) {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const h = parts[0]!, p = parts[1]!, s = parts[2]!;
        const signingInput = `${h}.${p}`;
        const expectedSig = await hmacSha256(new TextEncoder().encode(jwtSecret), signingInput);
        const expected = base64Url(expectedSig);
        if (expected !== s) return null;
        const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) return null;
        return payload;
    }
}
