import { createTransport, SentMessageInfo } from 'nodemailer'
import { readFileSync } from 'fs'
import mjml from 'mjml'

const transporter: SentMessageInfo = createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    auth: {
        user: 'support@ping-up.online',
        pass: 'u53UMvdWhFfWGHchCkdu'
    }
})

const sendMail = (
    email: string,
    subject: string,
    template: string,
    params: { [key: string]: string } = {},
    inReplyTo: string = '',
    references: string[] = []
): void => {
    let htmlMessage: string = readFileSync(`./src/mjmls/${template}.mjml`, 'utf8')

    for (const [ key, value ] of Object.entries(params))
        htmlMessage = htmlMessage.replace(new RegExp(`{${key}}`, 'g'), value)

    const mailOptions: any = {
        from: `Support System <support@ping-up.online>`,
        to: email,
        subject: subject,
        html: mjml(htmlMessage).html,
    }

    if (inReplyTo && references) {
        mailOptions.inReplyTo = inReplyTo
        mailOptions.references = references
    }

    transporter.sendMail(mailOptions).then().catch((err: Error): void => {
        console.log('Error sending mail: %s', err.message)
    })
}

export default sendMail