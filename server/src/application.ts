import express, { Router } from 'express'
import { json as bodyParserJson, urlencoded as bodyParserUrlencoded } from 'body-parser'
import { express as expressUserAgent } from 'express-useragent'
import { errorMiddleware, notfoundMiddleware } from './middlewares/error.middleware'

interface Controller {
    path: string
    router: Router
}

class Application {
    public app: express.Application
    private port: number = parseInt(process.env.WORK_PORT || '3000', 10)

    constructor(controllers: Controller[]) {
        this.app = express()

        this.initializeMiddlewares()
        this.initializeControllers(controllers)
        this.initializeErrorHandling()
    }

    private initializeMiddlewares(): void {
        this.app.use(bodyParserJson())
        this.app.use(bodyParserUrlencoded({ extended: false }))
        this.app.use(expressUserAgent())
    }

    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach((controller: Controller): void => {
            console.log(`✅ Registering routes for ${controller.path}`)
            this.app.use(controller.path, controller.router)
        })
    }

    private initializeErrorHandling(): void {
        this.app.use(errorMiddleware)
        this.app.use(notfoundMiddleware)
    }

    public listen(): void {
        this.app.listen(this.port, (): void => {
            console.log(`✅ App listening on the port ${this.port}`);
        })
    }
}

export default Application