'use strict'

const Schema = use('Schema')

class ProfileSchema extends Schema {
  up () {
    this.create('profiles', (table) => {
      table.increments()
      table.integer('user_id').unsigned()
      table.string('avatar')
      table.string('first_name',30).notNullable()
      table.string('last_name',40).notNullable()
      table.date('birthday')
      table.string('nationality',40).notNullable()
      table.string('gender', 10).notNullable()
      table.string('addr1_street',40).notNullable()
      table.string('addr1_housenr',10).notNullable()
      table.string('addr1_bus',10)
      table.string('addr1_postcode',15).notNullable()
      table.string('addr1_city',30).notNullable()
      table.string('addr1_country',30).notNullable()
      table.float('geo_latitude',10,6).defaultTo(0)
      table.float('geo_longitude',10,6).defaultTo(0)
      table.string('geo_address',150)
      table.string('geo_country_name',80)
      table.string('geo_country_code',10)
      table.string('geo_admin_level_1',80)
      table.string('geo_admin_level_2',80)
      table.string('geo_admin_level_1_short',80)
      table.string('geo_admin_level_2_short',80)
      table.string('geo_provider',40)    
      table.string('phone_1',20)
      table.string('mobile_1',20)
      table.string('fax_1',20)
      table.string('company_name',30)
      table.string('vat_number',20)
      table.string('company_addr_street',40)
      table.string('company_addr_housenr',10)
      table.string('company_addr_bus',10)
      table.string('company_addr_postcode',20)
      table.string('company_addr_city',30)
      table.string('company_addr_country',30)
      table.boolean('newsletter').defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('profiles')
  }
}

module.exports = ProfileSchema
