import path from 'path';
import knex from 'knex';
import { environment } from './app';


const config = (db = 'development') => ({
    client: 'sqlite3',
    connection: {
        filename: path.join(__dirname, `../../db/${db}.db`),
    },
    useNullAsDefault: true,
});

const db = knex(config(environment));

export { db, config };
