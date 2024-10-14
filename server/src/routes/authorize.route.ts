import { Router, Request, Response, NextFunction } from 'express'

export default class AuthorizeRoute {
    public path = '/authorize'
    public router: Router = Router()

    constructor() {
        this.router.post('/authorize/sign-in', this.getMe.bind(this))
    }

    private getMe = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    }
}