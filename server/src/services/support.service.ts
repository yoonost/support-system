import { Request } from 'express'
import { FieldPacket, ResultSetHeader, RowDataPacket } from '../storage'
import { randomStringUtil } from '../utils/randomString.util'

export class supportService {
    public async tickets (req: Request): Promise<{ code: number; data: string | object }> {
        try {
            /*const [ tickets ]: [ RowDataPacket[], FieldPacket[] ] = req.user?.role === 'admin'
                ? await req.storage.query(`
                SELECT t.ticket_id, t.source, t.status, t.subject, t.created_at, t.updated_at, 
                       (SELECT m.message FROM messages m WHERE m.ticket_id = t.ticket_id ORDER BY m.sent_at DESC LIMIT 1) as last_message
                FROM tickets t
                ORDER BY t.updated_at DESC
            `)
                : await req.storage.query(`
                SELECT t.ticket_id, t.source, t.status, t.subject, t.created_at, t.updated_at, 
                       (SELECT m.message FROM messages m WHERE m.ticket_id = t.ticket_id ORDER BY m.sent_at DESC LIMIT 1) as last_message
                FROM tickets t
                WHERE (t.source = 1 AND t.sender = ?) OR (t.source = 2 AND t.sender = ?)
                ORDER BY t.updated_at DESC
            `, [ req.user?.id, req.user?.email ])
            return { code: 200, data: tickets }*/
        } catch (error) {
            throw error
        }
    }
    public async new (subject: string, message: string, req: Request): Promise<{ code: number; data: string | object }> {
        try {
            const [ ticket ]: [ ResultSetHeader, FieldPacket[] ] =
                await req.storage.query('INSERT INTO `tickets` (`sender`, `source`, `subject`, `created_at`, `updated_at`) VALUES (?, 1, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())', [ req.user?.id, subject ])
            await req.storage.query('INSERT INTO `messages` (`message_id`, `ticket_id`, `sender`, `message`, `sent_at`) VALUES (?, ?, 1, ?, UNIX_TIMESTAMP())', [ randomStringUtil(32), ticket.insertId, message ])
            return { code: 200, data: { ticketId: ticket.insertId }}
        } catch (error) {
            throw error
        }
    }
    public async ticket (ticketId: number, req: Request): Promise<{ code: number; data: string | object }> {
        try {
            /*const [ ticket ]: [ RowDataPacket[], FieldPacket[] ] = req.user?.role === 'admin'
                ? await req.storage.query(`
                SELECT t.ticket_id, t.source, t.status, t.subject, t.created_at, t.updated_at,
                    (SELECT m.sender, m.message, m.sent_at FROM messages m WHERE m.ticket_id = t.ticket_id ORDER BY m.sent_at DESC) as messages
                FROM tickets t WHERE t.ticket_id = ? ORDER BY t.updated_at DESC
            `, [ ticketId ])
                : await req.storage.query(`
                SELECT t.ticket_id, t.source, t.status, t.subject, t.created_at, t.updated_at,
                    (SELECT m.sender, m.message, m.sent_at FROM messages m WHERE m.ticket_id = t.ticket_id) as messages
                FROM tickets t WHERE t.ticket_id = ? AND (t.source = 1 AND t.sender = ?) OR (t.source = 2 AND t.sender = ?) ORDER BY t.updated_at DESC
            `, [ ticketId, req.user?.id, req.user?.email ])*/


            return { code: 200, data: {
                ticket: {}, messages: {},
            }}
        } catch (error) {
            throw error
        }
    }
    public async send (ticketId: number, message: string, req: Request): Promise<{ code: number; data: string | object }> {
        try {
            /*const [ ticket ]: [ RowDataPacket[], FieldPacket[] ] = req.user?.role === 'admin'
                ? await req.storage.query('SELECT `ticket_id` FROM `tickets` WHERE `ticket_id` = ? LIMIT 1', [ ticketId ])
                : await req.storage.query('SELECT `ticket_id` FROM `tickets` WHERE `ticket_id` = ? AND (source = 1 AND sender = ?) OR (source = 2 AND sender = ?) LIMIT 1', [ ticketId, req.user?.id, req.user?.email ])
            if (ticket.length === 0) return { code: 404, data: 'Ticket not found or you do not have access' }

            const messageId: string = randomStringUtil(32)
            await req.storage.query('INSERT INTO `messages` (`message_id`, `ticket_id`, `sender`, `message`, `sent_at`) VALUES (?, ?, 1, ?, UNIX_TIMESTAMP())', [ messageId, ticketId, message ])

            return { code: 200, data: { messageId } }*/
        } catch (error) {
            throw error
        }
    }
}