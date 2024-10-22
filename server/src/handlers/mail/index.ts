import Imap, { ImapMessageBodyInfo, ImapMessage } from 'imap'
import { FieldPacket, PoolConnection, ResultSetHeader, RowDataPacket, storageCallback } from '../../storage'
import { ParsedMail, simpleParser } from 'mailparser'
import EmailReplyParser from 'email-reply-parser'
import sendMail from '../../utils/mail.util'
import { Stream } from 'node:stream'

let imapClient: Imap

function connectToMailBox (): void {
    imapClient = new Imap({
        user: process.env.IMAP_USER || '',
        password: process.env.IMAP_PASS || '',
        host: process.env.IMAP_HOST || '',
        port: 993,
        tls: true
    })

    imapClient.once('ready', (): void => {
        imapClient.openBox('INBOX', false, function(_: Error): void {
            console.log('[MAIL] Connected to mail inbox')
            imapClient.on('mail', function (_: any): void {
                imapClient.search(['UNSEEN'], function (_: Error, messageIds: number[]): void {
                    messageIds.forEach((messageId: number): void => fetchAndParseMessage(messageId))
                })
            })
        })
    })

    imapClient.once('error', (err: Error): void => {
        console.log('[MAIL] IMAP error', err.message)
        console.log('[MAIL] Reconnecting in 5 seconds...')
        setTimeout(connectToMailBox, 5000)
    })

    imapClient.once('end', (): void => {
        console.log('[MAIL] IMAP connection ended')
        console.log('[MAIL] Reconnecting in 5 seconds...')
        setTimeout(connectToMailBox, 5000)
    })

    imapClient.connect()
}

function fetchAndParseMessage (messageId: number): void {
    imapClient.addFlags(messageId, '\\Seen', (err: Error): void => {
        if (err) return console.log('[MAIL] Error when setting the flag', err)
        imapClient.fetch(messageId, { bodies: '', struct: true }).on('message', function (message: ImapMessage, _: number): void {
            message.on('body', function (stream: Stream, _: ImapMessageBodyInfo): void {
                simpleParser(stream, async (_: Error, parsed: ParsedMail): Promise<void> => {
                    await storageCallback(async (storage: PoolConnection): Promise<void> => {
                        await messageHandler (storage, parsed)
                    })
                })
            })
        })
    })
}

async function messageHandler (storage: PoolConnection, parsed: ParsedMail): Promise<void> {
    try {
        const emailMatch = parsed.from?.text.match(/<?([^<>]+@[^<>]+)>?/)
        if (!emailMatch) {
            console.log('[MAIL] Error: No email found in parsed message')
            return
        }

        const email: string = emailMatch[1]
        const messageId: string | undefined = parsed.messageId?.toString().replace(/[<>]/g, '')
        const inReplyTo: string | undefined = parsed.inReplyTo?.toString().replace(/[<>]/g, '')
        const subject: string | undefined = parsed.subject?.toString()
        const text: string = new EmailReplyParser().parseReply(<string>parsed.text?.toString())

        if (!email && !messageId && !text)
            return console.log('[MAIL] Error reading message info')

        if (!inReplyTo) {
            const [ ticket ]: [ ResultSetHeader, FieldPacket[] ] =
                await storage.query('INSERT INTO tickets (subject, status, created_at, updated_at, creator, source) VALUES (?, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), ?, 2)', [ subject ? subject : 'Ticket without a title', email ])
            await storage.query('INSERT INTO messages (message_id, ticket_id, message, role, sender, source, created_at) VALUES (?, ?, ?, 1, ?, 2, UNIX_TIMESTAMP())', [ messageId, ticket.insertId, text, email ])
            sendMail(email, `Confirmation of sending ticket #${ticket.insertId}`, 'ticket-confirm', { ticket_id: ticket.insertId.toString() })
        } else {
            const [ ticketId ]: [ RowDataPacket[], FieldPacket[] ] =
                await storage.query('SELECT ticket_id FROM messages WHERE message_id = ? LIMIT 1', [ inReplyTo ])

            if (ticketId.length === 0) {
                // If a support agent sends 2 or more messages at the same time without user response, an error occurs that the system...
                // cannot find the messageId. In this case we will use a “crutch” and search for the request body and the same email, status...
                // and ticket creation method. To display the message correctly and not to cause misunderstandings between support and client

                const [ ticketId ]: [ RowDataPacket[], FieldPacket[] ] =
                    await storage.query('SELECT ticket_id FROM tickets WHERE subject = ? AND status != 3 AND creator = ? AND source = 2 LIMIT 1', [ subject?.replace('Re: ', ''), email ])

                if (ticketId.length === 0) return
                    sendMail(email, 'Error when updating a ticket', 'ticket-error')

                await storage.query('INSERT INTO messages (message_id, ticket_id, message, role, sender, source, created_at) VALUES (?, ?, ?, 1, ?, 2, UNIX_TIMESTAMP())', [ messageId, ticketId[0].ticket_id, text, email ])
            } else
                await storage.query('INSERT INTO messages (message_id, ticket_id, message, role, sender, source, created_at) VALUES (?, ?, ?, 1, ?, 2, UNIX_TIMESTAMP())', [ messageId, ticketId[0].ticket_id, text, email ])
        }
    } catch (err) {
        console.log('[MAIL] Read error', err)
    }
}

connectToMailBox()