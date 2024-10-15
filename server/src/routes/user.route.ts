import { Router } from 'express'
import storageMiddleware from '../middlewares/storage.middleware'
import authorizeMiddleware from '../middlewares/authorize.middleware'
import userController from '../controllers/user.controller'

export default class authorizeRoute {
    private controller: userController = new userController()

    public path: string = '/user'
    public router: Router = Router()

    constructor() {
        this.router.get('/me', storageMiddleware, authorizeMiddleware, this.controller.getMe)
    }
}