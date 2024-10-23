import { FieldPacket, PoolConnection, ResultSetHeader, storageCallback } from '../../storage'
import { randomStringUtil } from '../../utils/randomString.util'

export const createTicket = async (userId: number, subject: string, message: string): Promise<number> => {
    return await storageCallback(async (storage: PoolConnection): Promise<number> => {
        const [ ticket ]: [ ResultSetHeader, FieldPacket[] ] =
            await storage.query('INSERT INTO tickets (subject, status, created_at, updated_at, creator, source) VALUES (?, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), ?, 3)', [subject, userId])
        await storage.query('INSERT INTO messages (message_id, ticket_id, message, role, sender, source, created_at) VALUES (?, ?, ?, 1, ?, 3, UNIX_TIMESTAMP())', [ randomStringUtil(32), ticket.insertId, message, userId ])
        return ticket.insertId
    })
}