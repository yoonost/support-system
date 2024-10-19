import { PoolConnection } from '../../storage'

export interface userProps {
    id: number
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