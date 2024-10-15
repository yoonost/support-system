import { Response } from 'express'
export const responseUtil = (code: number, data: any, res: Response): Response => {
    const response: any = {}
    response.status = code === 200
    if (code === 200) response.data = (typeof data === 'object') ? data : { message: data }
    else response.error = { code, message: (typeof data === 'string') ? data : undefined, ...((typeof data === 'object') ? data : undefined) }
    return res.status(code).json(response).end()
}