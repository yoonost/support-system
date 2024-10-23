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

export const storageCallback = async <T>(callback: (storage: PoolConnection) => Promise<T>): Promise<T> => {
    let Storage: PoolConnection | undefined;
    try {
        Storage = await storage.getConnection()
        return await callback(Storage)
    } catch (error) {
        console.error(error)
        throw error
    } finally {
        if (Storage) Storage.release()
    }
}