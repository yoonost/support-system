import { Pool, createPool, FieldPacket, RowDataPacket, PoolConnection, ResultSetHeader } from 'mysql2/promise'
export { FieldPacket, RowDataPacket, PoolConnection, ResultSetHeader }

export const storage: Pool = createPool({
    host: process.env.MYSQL_HOST,
    port: 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_TABL,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 900
})