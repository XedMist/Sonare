import RoleRepository from "@/repositories/RoleRepository";
import UserRepository from "@/repositories/UserRepository";
import redisClient from "@/db/redis";

import { sign, verify } from 'hono/jwt'

import { compare } from 'bcrypt'

import { randomBytes } from 'crypto'
import { InternalServerError, UnauthorizedError } from "@/error/ApiError";

export interface TokenPayload {
    sub: string;
    name: string;
    role: string;
    exp: number;
    iat: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}


export default class AuthService {
    private userRepository = new UserRepository();
    private roleRepository = new RoleRepository();

    private readonly ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutos
    private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 dias 

    private generateRefreshToken(): string {
        return randomBytes(32).toString('hex');
    }

    async login(username: string, password: string): Promise<AuthTokens | null> {
        const jwtSecret = process.env.JWT_SECRET
        if (!jwtSecret) throw new InternalServerError("No se ha configurado el JWT Secret");

        const user = await this.userRepository.findByUsername(username)
        if (!user) throw new UnauthorizedError("Nombre o contraseña incorrectos");

        // Compara el hash con la contraseña 
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) throw new UnauthorizedError("Nombre o contraseña incorrectos");

        // Token de acceso
        const payload = {
            sub: user.id,
            name: user.name,
            role: user.roleID,
            exp: Math.floor(Date.now() / 1000) + this.ACCESS_TOKEN_EXPIRY,
            iat: Math.floor(Date.now() / 1000)
        };

        const accessToken = await sign(payload, jwtSecret);

        // Token de refresh
        const refreshToken = this.generateRefreshToken();

        // El refresh se guarda en REDIS
        await redisClient.setEx(
            `refresh:${refreshToken}`,
            this.REFRESH_TOKEN_EXPIRY,
            JSON.stringify({
                userId: user.id,
                username: user.name,
                roleId: user.roleID
            })
        );

        return { accessToken, refreshToken }
    }

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string } | null> {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) throw new InternalServerError("No se ha configurado el JWT Secret");

        // Recupera el token 
        const data = await redisClient.get(`refresh:${refreshToken}`);
        if (!data) throw new UnauthorizedError("El token de refresh es invalido o ha expirado");
        const tokenData = JSON.parse(data);

        // El usuario aun existe
        const user = await this.userRepository.findByUsername(tokenData.username);
        if (!user) {
            // Se elimina el token no valido 
            await redisClient.del(`refresh:${refreshToken}`);
            throw new UnauthorizedError("El token de refresh es invalido o ha expirado");
        }

        const payload = {
            sub: user.id,
            name: user.name,
            role: user.roleID,
            exp: Math.floor(Date.now() / 1000) + this.ACCESS_TOKEN_EXPIRY,
            iat: Math.floor(Date.now() / 1000)
        };

        const accessToken = await sign(payload, jwtSecret);
        return { accessToken };
    }

    async revokeRefreshToken(refreshToken: string): Promise<boolean> {
        try {
            const result = await redisClient.del(`refresh:${refreshToken}`);
            return result > 0;
        } catch (error) {
            console.error('Error revoking token:', error);
            return false;
        }
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        try {
            const keys = await redisClient.keys('refresh:*');
            for (const key of keys) {
                const data = await redisClient.get(key);
                if (data) {
                    const tokenData = JSON.parse(data);
                    if (tokenData.userId === userId) {
                        await redisClient.del(key);
                    }
                }
            }
        } catch (error) {
            console.error('Error revoking all user tokens:', error);
        }
    }

    async validateToken(token: string): Promise<TokenPayload | null> {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) throw new InternalServerError("No se ha configurado el JWT Secret");

        try {
            const payload = await verify(token, jwtSecret) as unknown as TokenPayload;

            // Comprueba si ha expirado
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp < now) throw new UnauthorizedError("El token ha expirado")

            // Comprueba si el user sigue existiendo
            const user = await this.userRepository.findByUsername(payload.name);
            if (!user) throw new UnauthorizedError("Token no valido")

            return payload;
        } catch {
            throw new UnauthorizedError("Token no valido")
        }
    }

    async checkPermission(userId: string, capability: string, resource: string): Promise<boolean> {
        const user = await this.userRepository.findByIdWithPermissions(userId);

        if (!user) return false;

        return user.role.permissions.some(
            p => p.capability === capability && p.resource === resource
        );
    }
}
