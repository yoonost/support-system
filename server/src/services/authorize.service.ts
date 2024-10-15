import { PoolConnection, RowDataPacket, FieldPacket, ResultSetHeader } from 'mysql2/promise'
import randomStringUtil from '../utils/randomString.util'
import md5 from 'md5'

export default class authorizeService {
    public async signIn(email: string, password: string, storage: PoolConnection): Promise<{ code: number; data: string | object }> {
        try {
            const [ user ]: [ RowDataPacket[], FieldPacket[] ] =
                await storage.query('SELECT `id`, `email` FROM `users` WHERE `email` = ? AND `password` = ? LIMIT 1', [ email, md5(password) ])

            if (user.length === 0) {
                return { code: 404, data: 'User not found or incorrect password' }
            }

            return { code: 200, data: { sessionToken: await this.createSession(user[0].id, storage) }}
        } catch (error) {
            throw error
        }
    }
    public async signUp(email: string, password: string, storage: PoolConnection): Promise<{ code: number; data: string | object }> {
        try {
            const [ user ]: [ RowDataPacket[], FieldPacket[] ] =
                await storage.query('SELECT `id` FROM `users` WHERE `email` = ? LIMIT 1', [ email ])

            if (user.length !== 0) {
                return { code: 400, data: 'The email address is already registered. Please choose a different one' }
            }

            const [ result ]: [ ResultSetHeader, FieldPacket[] ] =
                await storage.query('INSERT INTO `users` (`email`, `password`) VALUES (?, ?)', [ email, md5(password) ])
            const sessionToken: string = await this.createSession(result.insertId, storage)

            return { code: 200, data: { sessionToken }}
        } catch (error) {
            throw error
        }
    }
    private async createSession (userId: number, storage: PoolConnection) {
        const token: string = randomStringUtil(128)
        const expires: number = Math.floor(Date.now() / 1000) + 10800

        await storage.query('INSERT INTO `sessions` (`userId`, `token`, `authorizationTime`, `expirationTime`) VALUES (?, ?, UNIX_TIMESTAMP(), ?)', [ userId, token, expires ])

        return token
    }
}