'use strict'

const Schema = use('Schema')

class ProductSchema extends Schema {
  up () {
    this.create('products', (table) => {
      table.increments()
      table.integer('user_id').unsigned().notNullable()
      table.boolean('active').defaultTo(0)
      table.string('pors',1).notNullable()
      table.integer('group').unsigned().notNullable()
      table.integer('category').unsigned().notNullable()
      table.integer('sub_category').unsigned().notNullable()
      table.boolean('loan_or_rent').defaultTo(0)
      table.decimal('commission', 8, 2).defaultTo(0).unsigned()
      table.string('title', 30)
      table.string('sub_title', 60)
      table.string('description', 200)
      table.decimal('price_hour', 8, 2).defaultTo(0).unsigned()
      table.decimal('price_day', 8, 2).defaultTo(0).unsigned()
      table.decimal('price_week', 8, 2).defaultTo(0).unsigned()
      table.decimal('price_month', 8, 2).defaultTo(0).unsigned()
      table.boolean('is_warranty').defaultTo(0)
      table.decimal('warranty_amount', 8, 2).defaultTo(0).unsigned()
      table.string('warranty_description', 200)
      table.boolean('available_mo').defaultTo(0)
      table.boolean('available_tue').defaultTo(0)
      table.boolean('available_wed').defaultTo(0)
      table.boolean('available_th').defaultTo(0)
      table.boolean('available_fr').defaultTo(0)
      table.boolean('available_sat').defaultTo(0)
      table.boolean('available_sun').defaultTo(0)
      table.boolean('rent_belgium').defaultTo(0)
      table.boolean('rent_netherlands').defaultTo(0)
      table.boolean('is_home_delivery').defaultTo(0)
      table.decimal('home_delivery_amount', 8, 2).defaultTo(0).unsigned()
      table.string('home_delivery_description', 200)
      table.string('picture_1')
      table.string('picture_2')
      table.string('picture_3')
      table.string('picture_4')
      table.string('picture_5')
      table.string('picture_6')
      table.string('picture_7')
      table.string('picture_8')
      table.timestamps()
    })
  }

  down () {
    this.drop('products')
  }
}

module.exports = ProductSchema
