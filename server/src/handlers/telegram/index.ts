import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api'
import { createTicket, getTickets } from './service'
import { isLength } from 'validator'
import {RowDataPacket} from '../../storage'
import moment from "moment/moment";

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
            message += `🗓️ Created: ${moment(ticket.created_at).format("MMM Do YY")} | Last update: ${moment(ticket.updated_at).format("MMM Do YY")}\n`
            message += `👤 Assigned to: ${ticket.assigned_id ? (ticket.assigned_name ? ticket.assigned_name : `Support agent ${ticket.assigned_id}`) : 'Not assigned'}\n`
            message += (ticket.status === 1 ? '🟢 Status: Open' : (ticket.status === 2 ? '🔵 Status: In progress' : '🔴 Status: Closed')) + '\n'
            if (ticket.last_message !== null) message += `📝 ${ticket.last_message}\n`
            message += `🔗 /ticket${ticket.ticket_id}\n\n`
        })

        return await bot.sendMessage(query.message.chat.id,
            message,
            { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[
                { text: '👣 Going back', callback_data: 'welcome-message' }
            ]]}
        })
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
        delete userState[message.chat.id]
    }
})