import { FieldPacket, PoolConnection, RowDataPacket, storage as Storage } from '../../storage'
import { randomStringUtil } from '../../utils/randomString.util'

const handler = async (storage: PoolConnection): Promise<void> => {
    const [ tickets ]: [ RowDataPacket[], FieldPacket[] ] =
        await storage.query('SELECT ticket_id FROM tickets WHERE updated_at <= UNIX_TIMESTAMP() - 604800 AND status != 3')
    for (const ticket of tickets) {
        const messageId: string = randomStringUtil(32)
        const message: string = 'The ticket has been automatically closed due to inactivity over the past 7 days. If you need further assistance, please create a new ticket or contact our support team'
        await storage.query('INSERT INTO messages (message_id, ticket_id, message, role, created_at) VALUES (?, ?, ?, 3, UNIX_TIMESTAMP())', [ messageId, ticket.ticket_id, message ])
        await storage.query('UPDATE tickets SET updated_at = UNIX_TIMESTAMP(), status = 3 WHERE ticket_id = ? LIMIT 1', [ ticket.ticket_id ])
    }
}

setInterval(async (): Promise<void> => {
    let storage
    try {
        storage = await Storage.getConnection()
        await handler(storage)
    } catch (error) {
        console.log(error)
    } finally {
        if (storage) storage.release()
    }
}, 10800)