import { Request, Response, NextFunction } from 'express'
import { supportService } from '../services/support.service'
import { responseUtil } from '../utils/response.util'

export class supportController {
    private service: supportService = new supportService()

    constructor() {
        this.messages = this.messages.bind(this)
        this.tickets = this.tickets.bind(this)
        this.newTicket = this.newTicket.bind(this)
        this.addMessage = this.addMessage.bind(this)
    }

    public async messages (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { ticketId } = req.body
            const { code, data } = await this.service.messages(ticketId, req)
            return responseUtil(code, data, res)
        } catch (error) {
            next(error)
        }
    }

    public async tickets (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { code, data } = await this.service.tickets(req)
            return responseUtil(code, data, res)
        } catch (error) {
            next(error)
        }
    }

    public async newTicket (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { subject, message } = req.body
            const { code, data } = await this.service.newTicket(subject, message, req)
            return responseUtil(code, data, res)
        } catch (error) {
            next(error)
        }
    }

    public async addMessage (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { ticketId, message } = req.body
            const { code, data } = await this.service.addMessage(ticketId, message, req)
            return responseUtil(code, data, res)
        } catch (error) {
            next(error)
        }
    }
}