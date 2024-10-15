import { Request, Response, NextFunction } from 'express'
import response from '../utils/response.util'

const errorMiddleware = (err: Error, req: Request, res: Response, _: NextFunction): Response => {
    console.error(`⛔ Server Error: ${err.message}`)
    return response(500, 'An internal server error occurred. Please try again later or contact support', res)
}

const notfoundMiddleware = (req: Request, res: Response, _: NextFunction): Response => {
    return response(404, 'The requested resource or endpoint could not be found. Please check the URL and try again', res)
}

export { errorMiddleware, notfoundMiddleware }