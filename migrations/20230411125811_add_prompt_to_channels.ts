import { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('channels', (table) => table.string('prompt'));
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('channels', (table) => table.dropColumn('prompt'));
}

