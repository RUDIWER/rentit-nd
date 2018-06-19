'use strict'

const Schema = use('Schema')

class MessageSchema extends Schema {
    up() {
        this.create('messages', (table) => {
            table.increments()
            table.integer('owner_id').unsigned().notNullable()
            table.integer('chain_id').unsigned().notNullable()
            table.integer('sender_id').unsigned().notNullable()
            table.integer('receiver_id').unsigned().notNullable()
            table.integer('product_id').unsigned()
            table.boolean('validated').defaultTo(0)
            table.boolean('unread').defaultTo(1)
            table.string('message_text', 500)
            table.string('message_title', 100)
            table.timestamps()
        })
    }

    down() {
        this.drop('messages')
    }
}

module.exports = MessageSchema
