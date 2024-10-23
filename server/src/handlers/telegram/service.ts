import {FieldPacket, PoolConnection, ResultSetHeader, RowDataPacket, storageCallback} from '../../storage'
import { randomStringUtil } from '../../utils/randomString.util'

export const createTicket = async (userId: number, subject: string, message: string): Promise<number> => {
    return await storageCallback(async (storage: PoolConnection): Promise<number> => {
        const [ ticket ]: [ ResultSetHeader, FieldPacket[] ] =
            await storage.query('INSERT INTO tickets (subject, status, created_at, updated_at, creator, source) VALUES (?, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), ?, 3)', [subject, userId])
        await storage.query('INSERT INTO messages (message_id, ticket_id, message, role, sender, source, created_at) VALUES (?, ?, ?, 1, ?, 3, UNIX_TIMESTAMP())', [ randomStringUtil(32), ticket.insertId, message, userId ])
        return ticket.insertId
    })
}

export const getTickets = async (userId: number): Promise<RowDataPacket[]> => {
    return await storageCallback(async (storage: PoolConnection): Promise<RowDataPacket[]> => {
        const [ tickets ]: [ RowDataPacket[], FieldPacket[] ] =
            await storage.query(`SELECT t.ticket_id, t.subject, t.status, t.created_at, t.updated_at, t.assigned_id, (SELECT u.username FROM users u WHERE u.id = t.assigned_id LIMIT 1) as assigned_name, (SELECT m.message FROM messages m WHERE m.ticket_id = t.ticket_id AND m.role != 3 ORDER BY m.created_at DESC LIMIT 1) as last_message FROM tickets t WHERE t.source = 3 AND t.creator = ? ORDER BY t.updated_at DESC`, [ userId ])
        return tickets
    })
}