import type { Knex } from 'knex';
import { config as appDbConfig } from './src/config/db';

const config: Knex.Config = appDbConfig(process.env.NODE_ENV);
/**
 * This is needed for running knex from cli or via npm scripts
 */
module.exports = config;
