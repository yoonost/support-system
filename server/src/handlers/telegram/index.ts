import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api'
import {createTicket, ticketResponse} from './service'

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN || '', { polling: true })
const userState: { [key: number]: { callback: string, ticket_id?: number } } = {}

const welcomeMessage = async (message: Message): Promise<any> => {
    await bot.sendMessage(message.chat.id, `👋 Welcome ${message.chat.first_name}! Please select one item from the menu`, { reply_markup: {
        inline_keyboard: [[
            { text: '📝 Create a ticket', callback_data: 'create-a-ticket' },
            { text: '🎫 My Tickets', callback_data: 'my-tickets' }
        ]]
    }})
    delete userState[message.chat.id]
}

bot.onText(/\/start/, async (message: Message): Promise<any> => {
    return welcomeMessage(message)
})

bot.on('message', async (message: Message): Promise<any> => {
    if (userState[message.chat.id] && userState[message.chat.id].callback === 'waiting-for-subject') {
        if (!message.text) return welcomeMessage(message)
        const ticketId: number = await createTicket(message.chat.id, message.text)
        await bot.sendMessage(message.chat.id, `🎫 Your ticket #${ticketId} has been successfully created! While you're waiting for a support agent, please describe in detail what happened so we can assist you better. 😊`, { reply_markup: {
            inline_keyboard: [[
                { text: '👣 Going back', callback_data: 'welcome-message' },
                { text: '🔒 Close my ticket', callback_data: 'close-ticket' }
            ]]
        }})
        userState[message.chat.id] = { callback: 'ticket-response', ticket_id: ticketId }
    }
    if (userState[message.chat.id] && userState[message.chat.id].callback === 'ticket-response') {
        if (!message.text) return welcomeMessage(message)
        await ticketResponse(message.chat.id, userState[message.chat.id].ticket_id ?? 0, message.text) // BUG
    }
})

bot.on('callback_query', async (query: CallbackQuery): Promise<any> => {
    if (query.message && query.data) {
        const chatId: number = query.message.chat.id
        const messageId: number = query.message.message_id
        const callbackName: string = query.data

        try {
            await bot.editMessageReplyMarkup(
                { inline_keyboard: [] },
                { chat_id: chatId, message_id: messageId }
            )
        } catch (e) {}

        if (callbackName === 'welcome-message') {
            return welcomeMessage(query.message)
        }

        if (callbackName === 'create-a-ticket') {
            await bot.sendMessage(chatId, '✏️ Please write the subject for your ticket below!', { reply_markup: {
                inline_keyboard: [[
                    { text: '👣 Going back', callback_data: 'welcome-message' }
                ]]
            }})
            userState[chatId] = { callback: 'waiting-for-subject' }
        }

        if (callbackName === 'my-tickets') {
            await bot.sendMessage(chatId, 'my-tickets')
        }

        if (callbackName === 'close-ticket') {
            await bot.sendMessage(chatId, 'close-ticket')
        }
    }
})