'use strict'

const Model = use('Model')

class Product extends Model {
	// RELATIONS
	user() {
		return this.hasOne('App/Models/User', 'user_id', 'id')
	}
}

module.exports = Product
