import { FieldPacket, PoolConnection, RowDataPacket, storageCallback } from '../../storage'
import { randomStringUtil } from '../../utils/randomString.util'
import sendMail from '../../utils/mail.util'

async function autoCloseHandler (storage: PoolConnection): Promise<void> {
    const [ tickets ]: [ RowDataPacket[], FieldPacket[] ] =
        await storage.query('SELECT ticket_id, source, creator FROM tickets WHERE updated_at <= UNIX_TIMESTAMP() - 604800 AND status != 3 LIMIT 500')
    for (const ticket of tickets) {
        const messageId: string = randomStringUtil(32)

        await storage.query('INSERT INTO messages (message_id, ticket_id, message, role, created_at) VALUES (?, ?, ?, 3, UNIX_TIMESTAMP())', [ messageId, ticket.ticket_id, 'The ticket has been automatically closed due to inactivity over the past 7 days. If you need further assistance, please create a new ticket or contact our support team' ])
        await storage.query('UPDATE tickets SET updated_at = UNIX_TIMESTAMP(), status = 3 WHERE ticket_id = ? LIMIT 1', [ ticket.ticket_id ])

        if (ticket.source === 2) {
            sendMail(ticket.creator, `Ticket #${ticket.ticket_id} has been closed`, 'ticket-closed', { ticket_id: ticket[0].ticket_id })
        }

        console.log(`[INFO] The handler automatically closed ticket #${ticket.ticket_id}`)
    }
}

setInterval(async (): Promise<void> => {
    await storageCallback(async (storage: PoolConnection): Promise<void> => {
        await autoCloseHandler (storage)
    })
}, 3600)