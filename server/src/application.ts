import express, { Router } from 'express'
import { json as bodyParserJson, urlencoded as bodyParserUrlencoded } from 'body-parser'
import { express as expressUserAgent } from 'express-useragent'
import { errorMiddleware, notfoundMiddleware } from './middlewares/error.middleware'

interface RouteProps {
    path: string
    router: Router
}

class Application {
    public app: express.Application
    private port: number = parseInt(process.env.WORK_PORT || '3000', 10)

    constructor(routes: RouteProps[]) {
        this.app = express()

        this.initializeMiddlewares()
        this.initializeRoutes(routes)
        this.initializeErrorHandling()
    }

    private initializeMiddlewares(): void {
        this.app.use(bodyParserJson())
        this.app.use(bodyParserUrlencoded({ extended: false }))
        this.app.use(expressUserAgent())
    }

    private initializeRoutes(routes: RouteProps[]): void {
        routes.forEach((route: RouteProps): void => {
            console.log(`✅ Registering route for ${route.path}`)
            this.app.use(route.path, route.router)
        })
    }

    private initializeErrorHandling(): void {
        this.app.use(errorMiddleware)
        this.app.use(notfoundMiddleware)
    }

    public listen(): void {
        this.app.listen(this.port, (): void => {
            console.log(`✅ App listening on the port ${this.port}`)
        })
    }
}

export default Application