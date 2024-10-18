import express, { Router } from 'express'
import { json as bodyParserJson, urlencoded as bodyParserUrlencoded } from 'body-parser'
import { express as expressUserAgent } from 'express-useragent'
import { errorMiddleware, notfoundMiddleware } from './middlewares/error.middleware'
import cors from 'cors'

interface routeProps {
    path: string
    router: Router
}

export class application {
    public app: express.Application
    private port: number = parseInt(process.env.WORK_PORT || '3000', 10)

    constructor(routes: routeProps[]) {
        this.app = express()

        this.app.disable('x-powered-by')
        this.app.use(cors({
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            allowedHeaders: ['Content-Type', 'Authorization']
        }))

        this.initializeMiddlewares()
        this.initializeRoutes(routes)
        this.initializeErrorHandling()
    }

    private initializeMiddlewares(): void {
        this.app.use(bodyParserJson())
        this.app.use(bodyParserUrlencoded({ extended: false }))
        this.app.use(expressUserAgent())
    }

    private initializeRoutes(routes: routeProps[]): void {
        routes.forEach((route: routeProps): void => {
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