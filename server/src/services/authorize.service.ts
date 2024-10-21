import { Request } from 'express'
import { RowDataPacket, FieldPacket, ResultSetHeader } from '../storage'
import { randomStringUtil } from '../utils/randomString.util'
import md5 from 'md5'

export class authorizeService {
    public async signIn(identifier: string, password: string, req: Request): Promise<{ code: number; data: string | object }> {
        try {
            const [ user ]: [ RowDataPacket[], FieldPacket[] ] =
                await req.storage.query('SELECT id FROM users WHERE (username = ? OR email = ?) AND password = ? LIMIT 1', [ identifier, identifier, md5(password) ])

            if (user.length === 0)
                return { code: 404, data: 'User not found or incorrect password' }

            return { code: 200, data: { sessionToken: await this.createSession(user[0].id, req) }}
        } catch (error) {
            throw error
        }
    }
    public async signUp(username: string, email: string, password: string, req: Request): Promise<{ code: number; data: string | object }> {
        try {
            const [ user ]: [ RowDataPacket[], FieldPacket[] ] =
                await req.storage.query('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1', [ username, email ])

            if (user.length !== 0)
                return { code: 400, data: 'This user is already registered. Please choose a different one' }

            const [ result ]: [ ResultSetHeader, FieldPacket[] ] =
                await req.storage.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, \'user\')', [ username, email, md5(password) ])
            const sessionToken: string = await this.createSession(result.insertId, req)

            return { code: 200, data: { sessionToken }}
        } catch (error) {
            throw error
        }
    }
    private async createSession (userId: number, req: Request) {
        const token: string = randomStringUtil(128)
        const expires: number = Math.floor(Date.now() / 1000) + 604800

        await req.storage.query('INSERT INTO sessions (userId, token, authorizationTime, expirationTime) VALUES (?, ?, UNIX_TIMESTAMP(), ?)', [ userId, token, expires ])

        return token
    }
}