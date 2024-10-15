import { Request, Response, NextFunction } from 'express'
import { storage as Storage } from '../storage'

export const storageMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let storage
    try {
        storage = await Storage.getConnection()

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