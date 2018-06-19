'use strict'

const Env = use('Env')
const Helpers = use('Helpers')
const fs = require('fs')
// https://www.npmjs.com/package/node-geocoder
const NodeGeocoder = require('node-geocoder')

class ProfileController {
	create({ view, session }) {
		return view.render('profile.profileForm')
	}

	async edit({ view, session, auth, locale }) {
		const user = await auth.getUser()
		const profile = await user.profile().fetch()
		return view.render('profile.profileForm', { profile })
	}

	async store({ request, session, auth, response, antl }) {
		// Get appRoot
		const appRoot = Env.get('APP_URL')
		// Get Profile data from form
		const profileData = request.except([ '_csrf', 'submit' ])
		// Define avatar image
		const avatar = request.file('avatar', {
			maxSize: '1mb',
			allowedExtension: [ 'png', 'jpg', 'jpeg', 'gif' ]
		})

		// Get User_id of logged in user to store in profile
		const user = await auth.getUser()
		const profile = await user.profile().fetch()
		profileData.user_id = user.id
		// SET AVATOR
		// Set standard avatar if no picture is coming from form
		const gender = profileData.gender
		if (!profile) {
			console.log('in 000000')
			if (gender === 'male') {
				profileData.avatar = appRoot + '/images/avatars/man.jpg'
			} else {
				profileData.avatar = appRoot + '/images/avatars/woman.jpg'
			}
		}
		// If avatar is changed (then clientName is name of new downloaded image on client site)
		if (avatar.clientName) {
			const fileName = profileData.user_id + '-avatar.' + avatar.subtype
			// Check if file not already exist and delete it before copuying the new one
			fs.exists(Helpers.publicPath('images/avatars/' + profileData.user_id + '/' + fileName), function(exists) {
				if (exists) {
					fs.unlinkSync(Helpers.publicPath('images/avatars/' + profileData.user_id + '/' + fileName))
				}
			})
			await avatar.move(Helpers.publicPath('images/avatars/' + profileData.user_id), { name: fileName })
			if (!avatar.moved()) {
				return avatar.error()
			}
			profileData.avatar = appRoot + '/images/avatars/' + profileData.user_id + '/' + fileName
		}

		// OPTIMIZE input data
		// Set Boolean for newsletter checkbox
		if (profileData.newsletter) {
			profileData.newsletter = true
		} else {
			profileData.newsletter = false
		}

		// GEOCODE ADDRESSS
		const options = {
			provider: 'google',
			// Optional depending on the providers
			httpAdapter: 'https', // Default
			apiKey: Env.get('GOOGLE_MAPS_API'),
			formatter: null // 'gpx', 'string', ...
		}
		const geocoder = NodeGeocoder(options)
		const address =
			profileData.addr1_housenr +
			' ' +
			profileData.addr1_street +
			' ' +
			profileData.addr1_city +
			' ' +
			profileData.addr1_postcode +
			' ' +
			profileData.addr1_country
		const result = await geocoder.geocode(address)
		profileData.geo_latitude = result[0].latitude
		profileData.geo_longitude = result[0].longitude
		profileData.geo_address = result[0].formattedAddress
		profileData.geo_country_name = result[0].country
		profileData.geo_country_code = result[0].countryCode
		profileData.geo_provider = result[0].provider
		profileData.geo_admin_level_1 = result[0].administrativeLevels.level1long
		profileData.geo_admin_level_2 = result[0].administrativeLevels.level2long
		profileData.geo_admin_level_1_short = result[0].administrativeLevels.level1short
		profileData.geo_admin_level_2_short = result[0].administrativeLevels.level2short
		// Store or Create Profile depending on 'exist' field
		try {
			let newRecord = 0
			if (!profile) {
				newRecord = 1
			} else {
				profile.merge(profileData)
				await profile.save()
				newRecord = 0
			}
		} finally {
			// Display success message
			if (newRecord === 0) {
				session.flash({
					notification: {
						type: 'success',
						message: antl.formatMessage('messages.profile_success')
					}
				})
				return response.redirect('back')
			}
			return response.redirect('/')
		}
	}
}

module.exports = ProfileController
