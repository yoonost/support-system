import { readFileSync } from 'fs'
import { compile } from 'handlebars'
import mjml2html from 'mjml'

export const generate = (
    template: string,
    params: { [key: string]: string | object[] } = {}
): string => {
    const mjmlTemplate: string = readFileSync(`./src/mjmls/${template}.mjml`, 'utf8')
    const handlebarsTemplate = compile(mjmlTemplate)
    const mjmlWithParams: string = handlebarsTemplate(params)
    const { html } = mjml2html(mjmlWithParams)
    return html
}