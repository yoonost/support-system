import { Request, Response, NextFunction } from 'express'
import { authorizeService } from '../services/authorize.service'
import { responseUtil } from '../utils/response.util'

export class authorizeController {
    private service: authorizeService = new authorizeService()

    constructor() {
        this.signIn = this.signIn.bind(this)
        this.signUp = this.signUp.bind(this)
    }

    public async signIn (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { email, password } = req.body
            const { code, data } = await this.service.signIn(email, password, req.storage)
            return responseUtil(code, data, res)
        } catch (error) {
            next(error)
        }
    }

    public async signUp (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { email, password } = req.body
            const { code, data } = await this.service.signUp(email, password, req.storage)
            return responseUtil(code, data, res)
        } catch (error) {
            next(error)
        }
    }
}