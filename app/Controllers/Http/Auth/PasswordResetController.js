'use strict'

const { validate, validateAll } = use('Validator')
const User = use('App/Models/User')
const PasswordReset = use('App/Models/PasswordReset')
const randomString = require('random-string')
const Mail = use('Mail')
const Hash = use('Hash')

class PasswordResetController {
	showLinkRequestForm({ view }) {
		return view.render('auth.passwords.request')
	}

	async sendResetLinkEmail({ request, session, response, antl }) {
		// Valdiate form input
		const validation = await validate(request.only('email'), { email: 'required|email' })

		if (validation.fails()) {
			session.withErrors(validation.messages()).flashAll()
			return response.redirect('back')
		}

		try {
			// Get user
			const user = await User.findBy('email', request.input('email'))
			await PasswordReset.query().where('email', user.email).delete()

			const { token } = await PasswordReset.create({
				email: user.email,
				token: randomString({ length: 40 })
			})

			const mailData = {
				user: user.toJSON(),
				token
			}

			await Mail.send('auth.emails.password_reset', mailData, (message) => {
				message.to(user.email).from('rudy.werner@telenet.be').subject('RENTIT -> Password reset link')
			})

			session.flash({
				notification: {
					type: 'success',
					message: antl.formatMessage('messages.password_link')
				}
			})

			return response.redirect('back')
		} catch (error) {
			session.flash({
				notification: {
					type: 'danger',
					message: antl.formatMessage('messages.no_user_email')
				}
			})

			return response.redirect('back')
		}
	}

	showresetForm({ params, view }) {
		return view.render('auth.passwords.reset', { token: params.token })
	}

	async reset({ request, session, response, antl }) {
		// Validate Form
		const validation = await validateAll(request.all(), {
			token: 'required',
			email: 'required|email',
			password: 'required|confirmed'
		})

		if (validation.fails()) {
			session.withErrors(validation.messages()).flashExcept([ 'password', 'password_confirmation' ])
			return response.redirect('back')
		}
		// Get user by email address
		try {
			const user = await User.findBy('email', request.input('email'))
			// Check if password reset token exist for this user

			const token = await PasswordReset.query()
				.where('email', user.email)
				.where('token', request.input('token'))
				.first()

			if (!token) {
				session.flash({
					notification: {
						type: 'danger',
						message: antl.formatMessage('messages.link_expired')
					}
				})
				return response.redirect('back')
			}

			// save new password
			user.password = await Hash.make(request.input('password'))
			await user.save()

			// Delete password link token
			await PasswordReset.query().where('email', user.email).delete()

			// Display Success message
			session.flash({
				notification: {
					type: 'success',
					message: antl.formatMessage('messages.password_reset')
				}
			})
			return response.redirect('/login')
		} catch (error) {
			// Display error message
			session.flash({
				notification: {
					type: 'danger',
					message: antl.formatMessage('messages.no_user_email')
				}
			})
			return response.redirect('back')
		}
	}
}

module.exports = PasswordResetController
