import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.dateTime('data').notNullable()
    table.boolean('diet').notNullable()
    table.uuid('user_id').references('id').inTable('users')
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('update_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
