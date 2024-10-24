import TelegramBot, {Message, CallbackQuery, InlineKeyboardButton} from 'node-telegram-bot-api'
import { FieldPacket, PoolConnection, ResultSetHeader, RowDataPacket, storageCallback } from '../../storage'
import { randomStringUtil } from '../../utils/randomString.util'
import { isLength } from 'validator'
import moment from 'moment/moment'

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN || '', { polling: true })

const userState: {
    [key: number]: {
        callback?: string,
        ticket_id?: number,
        subject?: string
    }
} = {}

const welcomeMessage = async (message: Message): Promise<any> => {
    await bot.sendMessage(message.chat.id, `👋 Welcome ${message.chat.first_name}! Please select one item from the menu`, { reply_markup: { inline_keyboard: [[
        { text: '📝 Create a ticket', callback_data: 'create-a-ticket' },
        { text: '🎫 My Tickets', callback_data: 'my-tickets' }
    ]]}})
    delete userState[message.chat.id]
}

bot.onText(/\/start/, async (message: Message): Promise<any> => {
    return welcomeMessage(message)
})

bot.onText(/\/ticket_(\d+)/, async (message: Message, match: RegExpExecArray | null): Promise<any> => {
    if (match) {
        const { code, data } = await getTicket(message.chat.id, match[1])
        if (code !== 200) return bot.sendMessage(message.chat.id, `⛔ ${data}`)

        let msg = `📌 #${data.ticket_id} ${data.subject}\n`
        msg += `🗓️ Created: ${moment(data.created_at * 1000).format("MMM Do YY")} | Last update: ${moment(data.updated_at * 1000).format("MMM Do YY")}\n`
        msg += `👤 Assigned to: ${data.assigned_id ? (data.assigned_name ? data.assigned_name : `Support agent ${data.assigned_id}`) : 'Not assigned'}\n`
        msg += (data.status === 1 ? '🟢 Status: Open' : (data.status === 2 ? '🔵 Status: In progress' : '🔴 Status: Closed')) + '\n\n'

        if (data.messages && data.messages.length > 0) {
            msg += `💬 Messages:\n`
            data.messages.forEach((ticketMessage: any, index: number) => {
                const senderMap: { [key: number]: string } = {
                    1: ticketMessage.sender_name || `#${ticketMessage.sender}`,
                    2: ticketMessage.sender_name || ticketMessage.sender,
                    3: ticketMessage.sender_name || `Telegram #${ticketMessage.sender}`
                }
                msg += `\n🕒 ${moment(ticketMessage.created_at * 1000).format("MMM Do YY")} - 👤 ${senderMap[ticketMessage.source] || 'unknown'}\n`
                msg += `📄 ${ticketMessage.message}\n`
            })
        } else
            msg += `💬 No messages in this ticket.\n`

        userState[message.chat.id] = { ...userState[message.chat.id],
            callback: 'send-ticket',
            ticket_id: parseInt(match[1])
        }

        const buttons: InlineKeyboardButton[] = [
            { text: '👣 Going back', callback_data: 'welcome-message' },
            data.status !== 3 ? { text: '🔴 Close ticket', callback_data: 'close-ticket' } : null
        ].filter(Boolean) as InlineKeyboardButton[]

        return await bot.sendMessage(message.chat.id, msg, { reply_markup: { inline_keyboard: [buttons] }})
    } else
        await bot.sendMessage(message.chat.id, '⛔ Incorrect command format. Use /ticket_(id), where id is a number.')
})

bot.on('callback_query', async (query: CallbackQuery): Promise<any> => {
    if (!query.message || !query.data) return

    try {
        await bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            { chat_id: query.message.chat.id, message_id: query.message.message_id }
        )
    } catch (err) {}

    if (query.data === 'create-a-ticket') {
        await bot.sendMessage(query.message.chat.id, `✏️ Please write the subject for your ticket below!`, { reply_markup: { inline_keyboard: [[
            { text: '👣 Going back', callback_data: 'welcome-message' }
        ]]}})
        return userState[query.message.chat.id] = { ...userState[query.message.chat.id], callback: 'waiting-for-subject' }
    }

    if (query.data === 'my-tickets') {
        let message = '🎫 Your tickets\n\n'
        const tickets: RowDataPacket[] = await getTickets (query.message.chat.id)

        tickets.map((ticket: RowDataPacket): void => {
            message += `📌 #${ticket.ticket_id} ${ticket.subject}\n`
            message += `🗓️ Created: ${moment(ticket.created_at * 1000).format("MMM Do YY")} | Last update: ${moment(ticket.updated_at * 1000).format("MMM Do YY")}\n`
            message += `👤 Assigned to: ${ticket.assigned_id ? (ticket.assigned_name ? ticket.assigned_name : `Support agent ${ticket.assigned_id}`) : 'Not assigned'}\n`
            message += (ticket.status === 1 ? '🟢 Status: Open' : (ticket.status === 2 ? '🔵 Status: In progress' : '🔴 Status: Closed')) + '\n'
            if (ticket.last_message !== null) message += `📝 ${ticket.last_message}\n`
            message += `🔗 /ticket_${ticket.ticket_id}\n\n`
        })

        return await bot.sendMessage(query.message.chat.id,
            message,
            { reply_markup: { inline_keyboard: [[
                { text: '👣 Going back', callback_data: 'welcome-message' }
            ]]}
        })
    }

    if (query.data === 'close-ticket') {
        const { code, data } = await closeTicket(query.message.chat.id, userState[query.message.chat.id].ticket_id ?? 0)
        if (code !== 200) return bot.sendMessage(query.message.chat.id, `⛔ ${data}`)
        return bot.sendMessage(query.message.chat.id, `✔ Ticket #${data} successfully closed`, { reply_markup: { inline_keyboard: [[
            { text: '👣 Going back', callback_data: 'welcome-message' }
        ]]}})
    }

    return welcomeMessage(query.message)
})

bot.on('message', async (message: Message): Promise<any> => {
    if (!userState[message.chat.id] || !message.text) return

    if (userState[message.chat.id]?.callback === 'waiting-for-subject') {
        if (!isLength(message.text, { min: 5, max: 100 })) {
            return await bot.sendMessage(message.chat.id, `⛔ Subject must be between 5 and 100 characters long`, { reply_markup: { inline_keyboard: [[
                { text: '👣 Going back', callback_data: 'welcome-message' }
            ]]}})
        }
        await bot.sendMessage(message.chat.id, `*Subject: ${message.text}*\n\n✏️ Please write the message for your ticket below`, { parse_mode: 'MarkdownV2', reply_markup: { inline_keyboard: [[
            { text: '👣 Going back', callback_data: 'welcome-message' }
        ]]}})
        return userState[message.chat.id] = { ...userState[message.chat.id],
            callback: 'waiting-for-message',
            subject: message.text
        }
    }

    if (userState[message.chat.id].callback === 'waiting-for-message') {
        if (!isLength(message.text, { min: 1, max: 500 })) {
            return await bot.sendMessage(message.chat.id, `⛔ Message must be between 1 and 500 characters long`, { reply_markup: { inline_keyboard: [[
                { text: '👣 Going back', callback_data: 'welcome-message' }
            ]]}})
        }
        const ticketId: number = await createTicket(message.chat.id, userState[message.chat.id].subject ?? 'Ticket without a title', message.text)
        await bot.sendMessage(message.chat.id, `🎫 Your ticket #${ticketId} has been successfully created! You will receive a message when the ticket has been processed`, { reply_markup: { inline_keyboard: [[
            { text: '👣 Going back', callback_data: 'welcome-message' }
        ]]}})
        return delete userState[message.chat.id]
    }

    if (userState[message.chat.id].callback === 'send-ticket') {
        if (!isLength(message.text, { min: 1, max: 500 })) {
            return await bot.sendMessage(message.chat.id, `⛔ Message must be between 1 and 500 characters long`, { reply_markup: { inline_keyboard: [[
                { text: '👣 Going back', callback_data: 'welcome-message' }
            ]]}})
        }
        const { code, data } = await sendTicket(message.chat.id, userState[message.chat.id].ticket_id ?? 0, message.text)
        if (code !== 200) return bot.sendMessage(message.chat.id, `⛔ ${data}`)
        return bot.sendMessage(message.chat.id, `✔ Your message has been delivered`, { reply_markup: { inline_keyboard: [[
            { text: '👣 Going back', callback_data: 'welcome-message' }
        ]]}})
    }
})

export const sendMessage = (userId: string, ticketId: number, message: string): void => {
    bot.sendMessage(userId, `${message}\n\n/ticket_${ticketId}`)
}

const createTicket = async (userId: number, subject: string, message: string): Promise<number> => {
    return await storageCallback(async (storage: PoolConnection): Promise<number> => {
        const [ ticket ]: [ ResultSetHeader, FieldPacket[] ] =
            await storage.query('INSERT INTO tickets (subject, status, created_at, updated_at, creator, source) VALUES (?, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), ?, 3)', [subject, userId])
        await storage.query('INSERT INTO messages (message_id, ticket_id, message, role, sender, source, created_at) VALUES (?, ?, ?, 1, ?, 3, UNIX_TIMESTAMP())', [ randomStringUtil(32), ticket.insertId, message, userId ])
        return ticket.insertId
    })
}

const getTickets = async (userId: number): Promise<RowDataPacket[]> => {
    return await storageCallback(async (storage: PoolConnection): Promise<RowDataPacket[]> => {
        const [ tickets ]: [ RowDataPacket[], FieldPacket[] ] =
            await storage.query(`SELECT t.ticket_id, t.subject, t.status, t.created_at, t.updated_at, t.assigned_id, (SELECT u.username FROM users u WHERE u.id = t.assigned_id LIMIT 1) as assigned_name, (SELECT m.message FROM messages m WHERE m.ticket_id = t.ticket_id AND m.role != 3 ORDER BY m.created_at DESC LIMIT 1) as last_message FROM tickets t WHERE t.source = 3 AND t.creator = ? ORDER BY t.updated_at DESC`, [ userId ])
        return tickets
    })
}

const getTicket = async (userId: number, ticketId: string): Promise<{ code: number; data: any }> => {
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

const sendTicket = async (userId: number, ticketId: number, message: string): Promise<{ code: number; data: string | undefined; }> => {
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

const closeTicket = async (userId: number, ticketId: number): Promise<{ code: number; data: string; }> => {
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