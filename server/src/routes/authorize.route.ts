import { Router } from 'express'
import { signInDto, signUpDto } from '../dtos/authorize.dto'
import { validationMiddleware } from '../middlewares/validation.middleware'
import { storageMiddleware } from '../middlewares/storage.middleware'
import { authorizeController } from '../controllers/authorize.controller'

export class authorizeRoute {
    private controller: authorizeController = new authorizeController()

    public path: string = '/authorize'
    public router: Router = Router()

    constructor() {
        this.router.post('/sign-in', validationMiddleware(signInDto), storageMiddleware, this.controller.signIn)
        this.router.post('/sign-up', validationMiddleware(signUpDto), storageMiddleware, this.controller.signUp)
    }
}