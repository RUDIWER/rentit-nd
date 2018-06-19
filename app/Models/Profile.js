'use strict'

const Model = use('Model')

class Profile extends Model {
	// RELATIONS
	user() {
		return this.belongsTo('App/Model/User')
	}

	// HOOKS
	static boot() {
		super.boot()
		this.addHook('afterFind', async (profileInstance) => {
			// Reformat profile.birthday
			var month = profileInstance.birthday.getMonth() + 1
			var day = profileInstance.birthday.getDate()
			if (day < 10) {
				day = '0' + day
			}
			if (month < 10) {
				month = '0' + month
			}
			profileInstance.birthday = profileInstance.birthday.getFullYear() + '-' + month + '-' + day
		})
	}
}

module.exports = Profile
