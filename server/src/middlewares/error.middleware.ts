import { Request, Response, NextFunction } from 'express'
import { responseUtil } from '../utils/response.util'

export const errorMiddleware = (err: Error, req: Request, res: Response, _: NextFunction): Response => {
    console.error(`⛔ Server Error: ${err.message}`)
    return responseUtil(500, 'An internal server error occurred. Please try again later or contact support', res)
}

export const notfoundMiddleware = (req: Request, res: Response, _: NextFunction): Response => {
    return responseUtil(404, 'The requested resource or endpoint could not be found. Please check the URL and try again', res)
}