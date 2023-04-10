import path from 'path';
import knex from 'knex';


const config = (db = 'development') => ({
    client: 'sqlite3',
    connection: {
        filename: path.join(__dirname, `../../db/${db}.db`),
    },
    useNullAsDefault: true,
});

const db = knex(config(process.env.NODE_ENV));

export { db, config };
