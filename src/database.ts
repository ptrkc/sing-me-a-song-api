import pg from "pg";

const { Pool } = pg;

let config;

if (process.env.DATABASE_URL) {
    config = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    };
} else {
    config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        database:
            process.env.NODE_ENV === "test"
                ? process.env.DB_TEST_DATABASE
                : process.env.DB_DATABASE,
    };
}

const db = new Pool(config);

export default db;
