import TelegramBot, {Message, CallbackQuery, InlineKeyboardButton} from 'node-telegram-bot-api'
import {closeTicket, createTicket, getTicket, getTickets, sendTicket} from './service'
import { RowDataPacket } from '../../storage'
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