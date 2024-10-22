import { createTransport, SentMessageInfo } from 'nodemailer'
import { generate } from './mjml.util'

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
    params: { [key: string]: string | object[] } = {},
    inReplyTo: string = '',
    references: string[] = []
): void => {
    const mailOptions: any = {
        from: `Support System <support@ping-up.online>`,
        to: email,
        subject: subject,
        html: generate(template, params),
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