'use strict'
const User = use('App/Models/User')
const Profile = use('App/Models/Profile')
const Hash = use('Hash')

class LoginController {
	showLoginForm({ view, session }) {
		return view.render('auth.login')
	}

	async login({ request, session, auth, response, antl }) {
		// get form data
		const { email, password, remember } = request.all()
		// retrieve user based on form data
		const user = await User.query().where('email', email).where('is_active', true).first()
		// if user found verify password
		if (user) {
			const passwordVerified = await Hash.verify(password, user.password)

			// login user is password ok
			if (passwordVerified) {
				await auth.remember(!!remember).login(user)

				// Check if there already is a profile for this user, if not -> goto profile page
				const profile = await Profile.query().where('user_id', user.id).first()
				// If not
				if (!profile) {
					session.flash({
						notification: {
							type: 'warning',
							message: antl.formatMessage('messages.no_profile')
						}
					})
					return response.redirect('/profile/create')
				}
				return response.route('home')
			}
		}

		// Display error message if user not found
		session.flash({
			notification: {
				type: 'danger',
				message: antl.formatMessage('messages.no_user')
			}
		})

		return response.redirect('back')
	}
}

module.exports = LoginController
