'use strict'

const Schema = use('Schema')

class ProdCategorySchema extends Schema {
  up () {
    this.create('prod_categories', (table) => {
      table.increments()
      table.string('pors', 1) // Product or Service
      table.string('category_name', 35)
      table.integer('parent_category_id').unsigned()
      table.decimal('commission_procent', 8, 2).default(0).unsigned().nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('prod_categories')
  }
}

module.exports = ProdCategorySchema
