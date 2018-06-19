'use strict'

const Database = use('Database')
const Product = use('App/Models/Product')
const User = use('App/Models/User')
const Message = use('App/Models/Message')

class MessageController {
	async list({ view, session, auth }) {
		const user = await auth.getUser()
		const profile = await user.profile().fetch()
		if (!user) {
			return 'U bent niet ingelogd !!!!'
		}
		const messages = await Database.select(
			'msg.*',
			'sender.username as sender_name',
			'receiver.username as receiver_name'
		)
			.join('users as sender', 'msg.sender_id', '=', 'sender.id')
			.join('users as receiver', 'msg.receiver_id', '=', 'receiver.id')
			.from('messages as msg')
			.where('owner_id', user.id)
		return view.render('message.messageList', { messages, user, profile })
	}

	async create({ view, session, auth, params, antl }) {
		const user = await auth.getUser()
		if (!user) {
			return 'U bent niet ingelogd !!!!'
		}
		const profile = await user.profile().fetch()
		const message = new Message()
		const receiver = await User.find(params.receiverId)
		const today = new Date()
		const chainId = parseInt(params.chainId)
		const productId = parseInt(params.productId)
		message.id = 0
		message.sender_id = user.id
		message.sender_name = user.username
		message.receiver_name = receiver.username
		message.receiver_id = receiver.id
		message.created_at = today.toDateString()
		if (!chainId) {
			// If new mail  and not a request to a existing mail
			if (productId) {
				// If mail subject is about a product
				const product = await Product.find(productId)
				message.product_id = product.id
				const title = antl.formatMessage('mail.message_info')
				message.message_title = title + ' ' + product.id + ' / ' + product.title
			} else {
				// Mail is not about a product other mail subject
				message.message_title = antl.formatMessage('mail.message_info')
			}
		} else {
			// If request to existing mail
			message.message_title = antl.formatMessage('mail.message_req') + message.receiver_name
			message.chain_id = parseInt(params.chainId)
		}
		return view.render('message.messageForm', { message, user, profile })
	}

	async edit({ view, session, auth, params }) {
		const user = await auth.getUser()
		const profile = await user.profile().fetch()
		const message = await Message.find(params.id)
		const receiver = await User.find(message.receiver_id)
		const sender = await User.find(message.sender_id)
		message.sender_name = sender.username
		message.receiver_name = receiver.username
		if (!user) {
			return 'U bent niet ingelogd !!!!'
		}
		return view.render('message.messageForm', { user, profile, message })
	}
	async send({ request, response, view, session, auth, params, antl }) {
		const sender = await auth.getUser()
		if (!sender) {
			return 'U bent niet ingelogd !!!!'
		}
		const product = await Product.find(params.productId)
		const receiver = await User.find(params.receiverId)
		const chainId = parseInt(params.chainId)
		// return params.chainId

		// Flash old values to the session
		session.flashAll()
		// Get formData data from form
		const messageData = request.except([ '_csrf', 'submit' ])

		// Check if sender != Receiver and if send notification
		if (sender.id === receiver.id) {
			// Display error message if no product prices when mode is RENT
			session.flash({
				notification: {
					type: 'danger',
					message: antl.formatMessage('mail.no_message_to_yourself')
				}
			})
			return response.redirect('back')
		}

		// We store each message twice one for the sender and one for te receiver
		// So they can each delete and change their own posts
		// Not sure if this is the best method rethink it later

		const messageSender = new Message()
		const messageReceiver = new Message()

		// chainId is used to group messages in conversations
		// if new message chainId=0 and on save new chainId is created

		if (chainId === 0) {
			// NEw email
			let lastChainId = await Database.from('messages').getMax('chain_id')
			if (!lastChainId) {
				lastChainId = 0
			}
			var newChainId = lastChainId + 1
			messageSender.chain_id = newChainId
			messageReceiver.chain_id = newChainId
			messageReceiver.message_title =
				antl.formatMessage('mail.message_info') + ' ' + product.id + ' / ' + product.title
			messageSender.message_title =
				antl.formatMessage('mail.message_info') + ' ' + product.id + ' / ' + product.title
		} else {
			// Request to existing email
			messageSender.chain_id = chainId
			messageReceiver.chain_id = chainId
			messageReceiver.message_title = messageReceiver.message_title =
				antl.formatMessage('mail.message_req') + message.sender_name
			messageSender.message_title = antl.formatMessage('mail.message_req') + message.sender_name
		}

		messageSender.owner_id = sender.id
		messageSender.validated = 0
		messageSender.unread = 1
		messageSender.message_text = messageData.message_text
		messageSender.sender_id = sender.id
		messageSender.receiver_id = receiver.id

		messageReceiver.owner_id = receiver.id
		messageReceiver.validated = 0
		messageReceiver.unread = 1
		messageReceiver.message_text = messageData.message_text
		messageReceiver.sender_id = sender.id
		messageReceiver.receiver_id = receiver.id

		await messageSender.save()
		await messageReceiver.save()
		session.flash({
			notification: {
				type: 'success',
				message: antl.formatMessage('mail.mail_success')
			}
		})

		return response.redirect('back')
	}
}

module.exports = MessageController
