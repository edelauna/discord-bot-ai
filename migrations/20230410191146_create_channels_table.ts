import { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('channels', table => {
        table.increments('id').primary();
        table.text('channel_id').unique().notNullable();
        table.boolean('active');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('channels');
}

