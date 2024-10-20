import { PoolConnection } from '../../storage'

export interface userProps {
    id: number
    username: string
    email: string
    role: string
}

declare global {
    namespace Express {
        interface Request {
            storage: PoolConnection
            user?: userProps
        }
    }
}