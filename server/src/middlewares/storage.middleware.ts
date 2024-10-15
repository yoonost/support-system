import { Request, Response, NextFunction } from 'express'
import pool from '../storage'

const storageMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let storage
    try {
        storage = await pool.getConnection()

        req.storage = storage

        res.on('finish', () => {
            if (req.storage) req.storage.release()
        })

        next()
    } catch (error) {
        if (storage) storage.release()
        next(error)
    }
}

export default storageMiddleware