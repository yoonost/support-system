import { PoolConnection } from '../../storage'

declare global {
    namespace Express {
        interface Request {
            storage: PoolConnection
            user?: object
        }
    }
}