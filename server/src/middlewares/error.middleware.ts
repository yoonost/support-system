import { Request, Response, NextFunction } from 'express'

const errorMiddleware = (err: Error, req: Request, res: Response, _: NextFunction): Response => {
    return res.status(500).json({
        status: false,
        error: {
            code: 500,
            message: 'An internal server error occurred. Please try again later or contact support.'
        }
    })
}

const notfoundMiddleware = (req: Request, res: Response, _: NextFunction): Response => {
    return res.status(404).json({
        status: false,
        error: {
            code: 404,
            message: 'The requested resource or endpoint could not be found. Please check the URL and try again.'
        }
    })
}

export { errorMiddleware, notfoundMiddleware }