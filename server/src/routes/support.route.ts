import { Router } from 'express'
import { messagesDto, newTicketDto, addMessageDto } from '../dtos/support.dto'
import { validationMiddleware } from '../middlewares/validation.middleware'
import { storageMiddleware } from '../middlewares/storage.middleware'
import { authorizeMiddleware } from '../middlewares/authorize.middleware'
import { supportController } from '../controllers/support.controller'

export class supportRoute {
    private controller: supportController = new supportController()

    public path: string = '/support'
    public router: Router = Router()

    constructor() {
        this.router.get('/messages', validationMiddleware(messagesDto), storageMiddleware, authorizeMiddleware, this.controller.messages)
        this.router.get('/tickets', storageMiddleware, authorizeMiddleware, this.controller.tickets)
        this.router.post('/new-ticket', validationMiddleware(newTicketDto), storageMiddleware, authorizeMiddleware, this.controller.newTicket)
        this.router.post('/add-message', validationMiddleware(addMessageDto), storageMiddleware, authorizeMiddleware, this.controller.addMessage)
    }
}