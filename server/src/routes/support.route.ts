import { Router } from 'express'
import { newTicketDto, addMessageDto } from '../dtos/support.dto'
import { validationMiddleware } from '../middlewares/validation.middleware'
import { storageMiddleware } from '../middlewares/storage.middleware'
import { authorizeMiddleware } from '../middlewares/authorize.middleware'
import { supportController } from '../controllers/support.controller'

export class supportRoute {
    private controller: supportController = new supportController()

    public path: string = '/ticket'
    public router: Router = Router()

    constructor() {
        this.router.get('/tickets', storageMiddleware, authorizeMiddleware, this.controller.tickets)
        this.router.post('/new', validationMiddleware(newTicketDto), storageMiddleware, authorizeMiddleware, this.controller.new)
        this.router.get('/:id', storageMiddleware, authorizeMiddleware, this.controller.ticket)
        this.router.post('/:id/send', validationMiddleware(addMessageDto), storageMiddleware, authorizeMiddleware, this.controller.send)
        this.router.put('/:id/close', storageMiddleware, authorizeMiddleware, this.controller.close)
        this.router.put('/:id/assigned', storageMiddleware, authorizeMiddleware, this.controller.assigned)
    }
}