import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api'
import { createTicket } from './service'
import { isLength } from 'validator'

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

    await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        { chat_id: query.message.chat.id, message_id: query.message.message_id }
    )

    if (query.data === 'create-a-ticket') {
        await bot.sendMessage(query.message.chat.id, `✏️ Please write the subject for your ticket below!`, { reply_markup: { inline_keyboard: [[
            { text: '👣 Going back', callback_data: 'welcome-message' }
        ]]}})
        return userState[query.message.chat.id] = { ...userState[query.message.chat.id],
            callback: 'waiting-for-subject'
        }
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