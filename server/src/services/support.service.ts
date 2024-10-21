import { Request } from 'express'
import { FieldPacket, ResultSetHeader, RowDataPacket } from '../storage'
import { randomStringUtil } from '../utils/randomString.util'

export class supportService {
    public async tickets (req: Request): Promise<{ code: number; data: string | object }> {
        try {
            const [ tickets ]: [ RowDataPacket[], FieldPacket[] ] = req.user?.role === 'admin' && (req.query.admin !== undefined)
                ? await req.storage.query(`SELECT t.ticket_id, t.subject, t.status, t.created_at, t.updated_at, t.creator, (SELECT u.username FROM users u WHERE u.id = t.creator AND t.source = 1 LIMIT 1) as creator_name, t.source, t.assigned_id, (SELECT u.username FROM users u WHERE u.id = t.assigned_id LIMIT 1) as assigned_name, (SELECT m.message FROM messages m WHERE m.ticket_id = t.ticket_id ORDER BY m.created_at DESC LIMIT 1) as last_message FROM tickets t ORDER BY t.updated_at DESC`)
                : await req.storage.query(`SELECT t.ticket_id, t.subject, t.status, t.created_at, t.updated_at, t.creator, (SELECT u.username FROM users u WHERE u.id = t.creator AND t.source = 1 LIMIT 1) as creator_name, t.source, t.assigned_id, (SELECT u.username FROM users u WHERE u.id = t.assigned_id LIMIT 1) as assigned_name, (SELECT m.message FROM messages m WHERE m.ticket_id = t.ticket_id ORDER BY m.created_at DESC LIMIT 1) as last_message FROM tickets t WHERE (t.source = 1 AND t.creator = ?) OR (t.source = 2 AND t.creator = ?) ORDER BY t.updated_at DESC`, [ req.user?.id, req.user?.email ])
            return { code: 200, data: tickets }
        } catch (error) {
            throw error
        }
    }
    public async new (subject: string, message: string, req: Request): Promise<{ code: number; data: string | object }> {
        try {
            const [ ticket ]: [ ResultSetHeader, FieldPacket[] ] =
                await req.storage.query('INSERT INTO tickets (subject, status, created_at, updated_at, creator, source) VALUES (?, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), ?, 1)', [ subject, req.user?.id ])

            const messageId: string = randomStringUtil(32)
            await req.storage.query('INSERT INTO messages (message_id, ticket_id, message, role, sender, source, created_at) VALUES (?, ?, ?, 1, ?, 1, UNIX_TIMESTAMP())', [ messageId, ticket.insertId, message, req.user?.id ])

            return { code: 200, data: { ticketId: ticket.insertId, messageId }}
        } catch (error) {
            throw error
        }
    }
    public async ticket (ticketId: number, req: Request): Promise<{ code: number; data: string | object }> {
        try {
            const [ ticket ]: [ RowDataPacket[], FieldPacket[] ] = req.user?.role === 'admin' && (req.query.admin !== undefined)
                ? await req.storage.query(`SELECT t.ticket_id, t.subject, t.status, t.created_at, t.updated_at, t.creator, (SELECT u.username FROM users u WHERE u.id = t.creator AND t.source = 1 LIMIT 1) as creator_name, t.source, t.assigned_id, (SELECT u.username FROM users u WHERE u.id = t.assigned_id LIMIT 1) as assigned_name FROM tickets t WHERE t.ticket_id = ? ORDER BY t.updated_at DESC`, [ ticketId ])
                : await req.storage.query(`SELECT t.ticket_id, t.subject, t.status, t.created_at, t.updated_at, t.creator, (SELECT u.username FROM users u WHERE u.id = t.creator AND t.source = 1 LIMIT 1) as creator_name, t.source, t.assigned_id, (SELECT u.username FROM users u WHERE u.id = t.assigned_id LIMIT 1) as assigned_name FROM tickets t WHERE t.ticket_id = ? AND (t.source = 1 AND t.creator = ?) OR (t.source = 2 AND t.creator = ?) ORDER BY t.updated_at DESC`, [ ticketId, req.user?.id, req.user?.email ])

            if (ticket.length === 0)
                return { code: 404, data: 'Ticket not found or you do not have access' }

            const [ messages ]: [ RowDataPacket[], FieldPacket[] ] =
                await req.storage.query(`SELECT m.message, m.role, m.sender, (SELECT u.username FROM users u WHERE u.id = m.sender AND m.source = 1 AND m.role != 3 LIMIT 1) as sender_name, m.source, m.created_at FROM messages m WHERE m.ticket_id = ? ORDER BY m.created_at DESC`, [ ticketId ])

            return { code: 200, data: { ...ticket[0], messages }}
        } catch (error) {
            throw error
        }
    }
    public async send (ticketId: number, message: string, req: Request): Promise<{ code: number; data: string | object }> {
        try {
            const isAdmin: boolean = req.user?.role === 'admin' && (req.query.admin !== undefined)
            const [ ticket ]: [ RowDataPacket[], FieldPacket[] ] = isAdmin
                ? await req.storage.query(`SELECT ticket_id, status, assigned_id FROM tickets WHERE ticket_id = ? LIMIT 1`, [ ticketId ])
                : await req.storage.query(`SELECT ticket_id, status, assigned_id FROM tickets WHERE ticket_id = ? AND (source = 1 AND creator = ?) OR (source = 2 AND creator = ?) LIMIT 1`, [ ticketId, req.user?.id, req.user?.email, req.user?.email ])

            if (ticket.length === 0)
                return { code: 404, data: 'Ticket not found or you do not have access' }

            if (ticket[0].status === 3)
                return { code: 400, data: 'This ticket is closed' }

            const role: number = isAdmin ? (ticket[0].assigned_id === req.user?.id ? 2 : 1) : 1

            if (isAdmin && role === 1)
                return { code: 400, data: 'This ticket is not assigned to you' }

            const messageId: string = randomStringUtil(32)
            await req.storage.query('INSERT INTO messages (message_id, ticket_id, message, role, sender, source, created_at) VALUES (?, ?, ?, ?, ?, 1, UNIX_TIMESTAMP())', [ messageId, ticketId, message, role, req.user?.id ])
            await req.storage.query('UPDATE tickets SET updated_at = UNIX_TIMESTAMP() WHERE ticket_id = ? LIMIT 1', [ ticketId ])

            return { code: 200, data: { messageId } }
        } catch (error) {
            throw error
        }
    }
    public async close (ticketId: number, req: Request): Promise<{ code: number; data: string | object | number }> {
        try {
            const isAdmin: boolean = req.user?.role === 'admin' && (req.query.admin !== undefined)
            const [ ticket ]: [ RowDataPacket[], FieldPacket[] ] = isAdmin
                ? await req.storage.query(`SELECT ticket_id, status, creator, assigned_id FROM tickets WHERE ticket_id = ? LIMIT 1`, [ ticketId ])
                : await req.storage.query(`SELECT ticket_id, status, creator, assigned_id FROM tickets WHERE ticket_id = ? AND (source = 1 AND creator = ?) OR (source = 2 AND creator = ?) LIMIT 1`, [ ticketId, req.user?.id, req.user?.email, req.user?.email ])

            if (ticket.length === 0)
                return { code: 404, data: 'Ticket not found or you do not have access' }

            if (ticket[0].status === 3)
                return { code: 400, data: 'This ticket is closed' }

            const role: number = isAdmin ? (ticket[0].assigned_id === req.user?.id ? 2 : 1) : 1

            if (isAdmin && role === 1)
                return { code: 400, data: 'This ticket is not assigned to you' }

            const messageId: string = randomStringUtil(32)
            const message: string = (isAdmin && role === 2) ? 'The ticket was closed by the administrator' : 'The ticket was closed by the creator of the request'

            await req.storage.query('INSERT INTO messages (message_id, ticket_id, message, role, sender, source, created_at) VALUES (?, ?, ?, 3, ?, 1, UNIX_TIMESTAMP())', [ messageId, ticketId, message, req.user?.id ])
            await req.storage.query('UPDATE tickets SET updated_at = UNIX_TIMESTAMP(), status = 3 WHERE ticket_id = ? LIMIT 1', [ ticketId ])

            return { code: 200, data: { ticketId: ticket[0].ticket_id } }
        } catch (error) {
            throw error
        }
    }
    public async assigned (ticketId: number, message: string, req: Request): Promise<{ code: number; data: string | object }> {
        return { code: 200, data: '' }
    }
}