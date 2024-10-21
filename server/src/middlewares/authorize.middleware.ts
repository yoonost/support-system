import { Request, Response, NextFunction } from 'express'
import { FieldPacket, RowDataPacket } from '../storage'
import { responseUtil } from '../utils/response.util'
import { userProps } from '../types/express'

export const authorizeMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string = req.headers.authorization?.split(' ')[1] || ''
        if (!token) return responseUtil(401, 'Authorization token is missing', res)

        const [ session ]: [ RowDataPacket[], FieldPacket[] ] =
            await req.storage.query('SELECT userId FROM sessions WHERE token = ? AND expirationTime > UNIX_TIMESTAMP() ORDER BY id DESC LIMIT 1', [ token ])
        if (session.length === 0) return responseUtil(401, 'Invalid or expired session token', res)

        const [ user ]: [ RowDataPacket[], FieldPacket[] ] =
            await req.storage.query('SELECT id, username, email, role FROM users WHERE id = ? LIMIT 1', [ session[0].userId ])
        if (user.length === 0) return responseUtil(401, 'User not found', res)

        await req.storage.query('UPDATE sessions SET activityTime = UNIX_TIMESTAMP() WHERE token = ?', [ token ])

        req.user = user[0] as userProps

        next()
    } catch (error) {
        next(error)
    }
}