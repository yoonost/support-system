import { createPool, Pool } from 'mysql2'

const pool: Pool = createPool({
    host: process.env.MYSQL_HOST,
    port: 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_TABL,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 900
})

export default pool.promise()