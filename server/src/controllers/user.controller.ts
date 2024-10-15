import { Request, Response, NextFunction } from 'express'
import response from '../utils/response.util'

export default class authorizeController {
    constructor() {
        this.getMe = this.getMe.bind(this)
    }

    public async getMe (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            return response(200, req.user, res)
        } catch (error) {
            next(error)
        }
    }
}