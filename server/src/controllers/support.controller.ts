import { Request, Response, NextFunction } from 'express'
import { supportService } from '../services/support.service'
import { responseUtil } from '../utils/response.util'

export class supportController {
    private service: supportService = new supportService()

    constructor() {
        this.tickets = this.tickets.bind(this)
        this.new = this.new.bind(this)
        this.ticket = this.ticket.bind(this)
        this.send = this.send.bind(this)
        this.close = this.close.bind(this)
        this.assigned = this.assigned.bind(this)
    }

    public async tickets (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { code, data } = await this.service.tickets(req)
            return responseUtil(code, data, res)
        } catch (error) {
            next(error)
        }
    }
    public async new (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { code, data } = await this.service.new(req.body.subject, req.body.message, req)
            return responseUtil(code, data, res)
        } catch (error) {
            next(error)
        }
    }
    public async ticket (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { code, data } = await this.service.ticket(parseInt(req.params.id), req)
            return responseUtil(code, data, res)
        } catch (error) {
            next(error)
        }
    }
    public async send (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { code, data } = await this.service.send(parseInt(req.params.id), req.body.message, req)
            return responseUtil(code, data, res)
        } catch (error) {
            next(error)
        }
    }
    public async close (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { code, data } = await this.service.close(parseInt(req.params.id), req)
            return responseUtil(code, data, res)
        } catch (error) {
            next(error)
        }
    }
    public async assigned (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { code, data } = await this.service.assigned(parseInt(req.params.id), req)
            return responseUtil(code, data, res)
        } catch (error) {
            next(error)
        }
    }
}