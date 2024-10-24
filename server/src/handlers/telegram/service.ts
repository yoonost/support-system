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

export const getTicket = async (userId: number, ticketId: string): Promise<{ code: number; data: any }> => {
    return await storageCallback(async (storage: PoolConnection): Promise<{ code: number; data: any }> => {
        const [ ticket ]: [ RowDataPacket[], FieldPacket[] ] =
            await storage.query(`SELECT t.ticket_id, t.subject, t.status, t.created_at, t.updated_at, t.creator, (SELECT u.username FROM users u WHERE u.id = t.creator AND t.source = 1 LIMIT 1) as creator_name, t.source, t.assigned_id, (SELECT u.username FROM users u WHERE u.id = t.assigned_id LIMIT 1) as assigned_name FROM tickets t WHERE t.ticket_id = ? AND t.source = 3 AND t.creator = ? ORDER BY t.updated_at DESC`, [ ticketId, userId ])

        if (ticket.length === 0)
            return { code: 404, data: 'Ticket not found or you do not have access' }

        const [ messages ]: [ RowDataPacket[], FieldPacket[] ] =
            await storage.query(`SELECT m.message, m.role, m.sender, (SELECT u.username FROM users u WHERE u.id = m.sender AND m.source = 1 AND m.role != 3 LIMIT 1) as sender_name, m.source, m.created_at FROM messages m WHERE m.ticket_id = ? ORDER BY m.created_at DESC`, [ ticketId ])

        return { code: 200, data: { ...ticket[0], messages }}
    })
}

export const sendTicket = async (userId: number, ticketId: number, message: string): Promise<{ code: number; data: string | undefined; }> => {
    return await storageCallback(async (storage: PoolConnection): Promise<{ code: number; data: string | undefined; }> => {
        const [ ticket ]: [ RowDataPacket[], FieldPacket[] ] =
            await storage.query(`SELECT ticket_id, subject, status, source, creator, assigned_id FROM tickets WHERE ticket_id = ? AND source = 3 AND creator = ? LIMIT 1`, [ ticketId, userId ])

        if (ticket.length === 0)
            return { code: 404, data: 'Ticket not found or you do not have access' }

        if (ticket[0].status === 3)
            return { code: 400, data: 'This ticket is closed' }

        const messageId: string = randomStringUtil(32)
        await storage.query('INSERT INTO messages (message_id, ticket_id, message, role, sender, source, created_at) VALUES (?, ?, ?, 1, ?, 3, UNIX_TIMESTAMP())', [ messageId, ticketId, message, userId ])
        await storage.query('UPDATE tickets SET updated_at = UNIX_TIMESTAMP() WHERE ticket_id = ? LIMIT 1', [ ticketId ])

        return { code: 200, data: undefined }
    })
}

export const closeTicket = async (userId: number, ticketId: number): Promise<{ code: number; data: string; }> => {
    return await storageCallback(async (storage: PoolConnection): Promise<{ code: number; data: string; }> => {
        const [ ticket ]: [ RowDataPacket[], FieldPacket[] ] =
            await storage.query(`SELECT ticket_id, subject, status, source, creator, assigned_id FROM tickets WHERE ticket_id = ? AND source = 3 AND creator = ? LIMIT 1`, [ ticketId, userId ])

        if (ticket.length === 0)
            return { code: 404, data: 'Ticket not found or you do not have access' }

        if (ticket[0].status === 3)
            return { code: 400, data: 'This ticket is closed' }

        const messageId: string = randomStringUtil(32)
        await storage.query('INSERT INTO messages (message_id, ticket_id, message, role, sender, source, created_at) VALUES (?, ?, ?, 3, ?, 3, UNIX_TIMESTAMP())', [ messageId, ticketId, 'The ticket was closed by the creator of the request', userId ])
        await storage.query('UPDATE tickets SET status = 3, updated_at = UNIX_TIMESTAMP() WHERE ticket_id = ? LIMIT 1', [ ticketId ])

        return { code: 200, data: ticket[0].ticket_id.toString() }
    })
}