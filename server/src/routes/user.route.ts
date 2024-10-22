import { Router } from 'express'
import { storageMiddleware } from '../middlewares/storage.middleware'
import { authorizeMiddleware } from '../middlewares/authorize.middleware'
import { userController } from '../controllers/user.controller'

export class userRoute {
    private controller: userController = new userController()

    public path: string = '/user' // eslint-disable-line @typescript-eslint/no-inferrable-types
    public router: Router = Router()

    constructor() {
        this.router.get('/me', storageMiddleware, authorizeMiddleware, this.controller.getMe)
    }
}