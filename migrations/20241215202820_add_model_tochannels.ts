import type { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('channels', (table) => table.string('model'));
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('channels', (table) => table.dropColumn('model'));
}

