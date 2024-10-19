import { Request, Response, NextFunction } from 'express'
import { responseUtil } from '../utils/response.util'

export class userController {
    constructor() {
        this.getMe = this.getMe.bind(this)
    }

    public async getMe (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            return responseUtil(200, req.user, res)
        } catch (error) {
            next(error)
        }
    }
}