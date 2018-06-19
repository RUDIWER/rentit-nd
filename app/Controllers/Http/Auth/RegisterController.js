'use strict'

const User = use('App/Models/User')
const randomString = require('random-string')
const Mail = use('Mail')

class RegisterController {
	showRegisterForm({ view }) {
		return view.render('auth.register')
	}

	async register({ request, session, response, antl }) {
		// Create user
		const user = await User.create({
			username: request.input('username'),
			email: request.input('email'),
			password: request.input('password'),
			confirmation_token: randomString({ length: 40 })
		})

		// Send confirmation email
		try {
			await Mail.send('auth.emails.confirm_email', user.toJSON(), (message) => {
				message.to(user.email).from('rudy.werner@telenet.be').subject('Please confirm your Email address ?')
			})
		} catch (e) {
			console.log(e)
			session.flash({
				notification: {
					type: 'danger',
					message: antl.formatMessage('messages.email_not_ok')
				}
			})
			// Delete created user !
			await user.delete()
			return response.redirect('back')
		}

		// Dispaly success message
		session.flash({
			notification: {
				type: 'success',
				message: antl.formatMessage('messages.registration_success')
			}
		})
		return response.redirect('/')
	}

	async confirmEmail({ params, session, response, antl }) {
		// Get user with the confirmation token
		const user = await User.findBy('confirmation_token', params.token) // params.token comes from route :token
		if (!user) {
			session.flash({
				notification: {
					type: 'danger',
					message: antl.formatMessage('messages.no_user_email')
				}
			})
			return response.redirect('/login')
		}

		// Set token to null and is_active to true
		user.confirmation_token = null
		user.is_Active = true
		// persist user to database
		await user.save()
		// Displaysuccess message
		session.flash({
			notification: {
				type: 'success',
				message: antl.formatMessage('messages.email_confirmed')
			}
		})
		return response.redirect('/login')
	}
}

module.exports = RegisterController
