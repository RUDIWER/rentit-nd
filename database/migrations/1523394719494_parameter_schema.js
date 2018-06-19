'use strict'

const Schema = use('Schema')

class ParameterSchema extends Schema {
  up () {
    this.create('parameters', (table) => {
      table.increments()
      table.decimal('loan_cost', 8, 2).default(0).unsigned();
      table.timestamps()
    })
  }

  down () {
    this.drop('parameters')
  }
}

module.exports = ParameterSchema
