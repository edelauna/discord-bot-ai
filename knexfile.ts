import type { Knex } from 'knex';
import { config as appDbConfig } from './src/config/db';
import { environment } from './src/config/app';

const config: Knex.Config = appDbConfig(environment);
/**
 * This is needed for running knex from cli or via npm scripts
 */
module.exports = config;
