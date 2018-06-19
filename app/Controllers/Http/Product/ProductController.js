const Env = use('Env')
const ProdCategory = use('App/Models/ProdCategory')
const Product = use('App/Models/Product')
const fs = require('fs')
const Helpers = use('Helpers')('use strict')

class ProductController {
	async index({ view, session, auth }) {
		const user = await auth.getUser()

		const profile = await user.profile().fetch()
		const products = (await Product.query().where('user_id', '=', user.id).fetch()).toJSON()
		return view.render('product.productList', { profile, products })
	}

	async ajaxGetGroup({ params }) {
		const groups = (await ProdCategory.query().where('parent_category_id', '=', params.id).fetch()).toJSON()
		return groups
	}

	async create({ view, session, auth }) {
		const user = await auth.getUser()
		const profile = await user.profile().fetch()
		const porses = (await ProdCategory.query().where('parent_category_id', '=', 0).fetch()).toJSON()
		const product = new Product()
		product.id = 0
		return view.render('product.productForm', { product, profile, porses })
	}

	async edit({ view, params, session, auth }) {
		const user = await auth.getUser()
		const profile = await user.profile().fetch()
		const product = await Product.find(params.id)
		const porses = (await ProdCategory.query().where('parent_category_id', '=', 0).fetch()).toJSON()
		const groups = (await ProdCategory.query().where('parent_category_id', '=', product.pors).fetch()).toJSON()
		const categories = (await ProdCategory.query().where('parent_category_id', '=', product.group).fetch()).toJSON()
		const sub_categories = (await ProdCategory.query()
			.where('parent_category_id', '=', product.category)
			.fetch()).toJSON()
		return view.render('product.productForm', { product, profile, porses, groups, categories, sub_categories })
	}

	async delete({ params, response, session, auth, antl }) {
		const user = await auth.getUser()
		const profile = await user.profile().fetch()
		var product = await Product.find(params.id)

		// DELETE PRODUCT DATA
		try {
			await product.delete()
		} catch (e) {
			console.log('there was an error')
			console.log(e)
		} finally {
			session.flash({
				notification: {
					type: 'success',
					message: antl.formatMessage('products.product_delete_success')
				}
			})
			return response.redirect('/my-products')
		}
	}

	async store({ request, response, params, session, auth, antl }) {
		// Get appRoot
		const appRoot = Env.get('APP_URL')
		// Flash old values to the session
		session.flashAll()
		// Get ProductData data from form
		const productData = request.except([ '_csrf', 'submit' ])
		// Get User_id of logged in user to store in profile
		const user = await auth.getUser()
		productData.user_id = user.id
		// DEFINE PICTURE PATHS
		const picture_1 = request.file('picture_1', {
			maxSize: '1mb',
			allowedExtension: [ 'png', 'jpg', 'jpeg', 'gif' ]
		})
		const picture_2 = request.file('picture_2', {
			maxSize: '1mb',
			allowedExtension: [ 'png', 'jpg', 'jpeg', 'gif' ]
		})
		const picture_3 = request.file('picture_3', {
			maxSize: '1mb',
			allowedExtension: [ 'png', 'jpg', 'jpeg', 'gif' ]
		})
		const picture_4 = request.file('picture_4', {
			maxSize: '1mb',
			allowedExtension: [ 'png', 'jpg', 'jpeg', 'gif' ]
		})
		const picture_5 = request.file('picture_5', {
			maxSize: '1mb',
			allowedExtension: [ 'png', 'jpg', 'jpeg', 'gif' ]
		})
		const picture_6 = request.file('picture_6', {
			maxSize: '1mb',
			allowedExtension: [ 'png', 'jpg', 'jpeg', 'gif' ]
		})

		// Check If PRICES ARE NEEDED AND IF NEEDED ARE FILLED IN ?
		if (productData.loan_or_rent == 0) {
			if (
				!productData.price_hour &&
				!productData.price_day &&
				!productData.price_week &&
				!productData.price_month
			) {
				// Display error message if no product prices when mode is RENT
				session.flash({
					notification: {
						type: 'danger',
						message: antl.formatMessage('messages.no_prices')
					}
				})
				return response.redirect('back')
			}
		}

		// OPTIMIZE input data
		// Set Booleans for checkboxes
		productData.rent_belgium ? (productData.rent_belgium = true) : (productData.rent_belgium = false)
		productData.rent_netherlands ? (productData.rent_netherlands = true) : (productData.rent_netherlands = false)
		productData.available_mo ? (productData.available_mo = true) : (productData.available_mo = false)
		productData.available_tue ? (productData.available_tue = true) : (productData.available_tue = false)
		productData.available_wed ? (productData.available_wed = true) : (productData.available_wed = false)
		productData.available_th ? (productData.available_th = true) : (productData.available_th = false)
		productData.available_fr ? (productData.available_fr = true) : (productData.available_fr = false)
		productData.available_sat ? (productData.available_sat = true) : (productData.available_sat = false)
		productData.available_sun ? (productData.available_sun = true) : (productData.available_sun = false)
		productData.is_warranty ? (productData.is_warranty = true) : (productData.is_warranty = false)
		productData.is_home_delivery ? (productData.is_home_delivery = true) : (productData.is_home_delivery = false)
		if (productData.price_hour == '') {
			productData.price_hour = 0
		}
		if (productData.price_day == '') {
			productData.price_day = 0
		}
		if (productData.price_week == '') {
			productData.price_week = 0
		}
		if (productData.price_month == '') {
			productData.price_month = 0
		}

		// Clear out warranty and delivery fields is switch is off (needed if previous was on)
		if (!productData.is_warranty) {
			productData.warranty_amount = 0
			productData.warranty_description = ''
		}

		if (!productData.is_warranty) {
			productData.home_delivery_amount = 0
			productData.home_delivery_description = ''
		}

		// SAVE PRODUCT DATA
		if (params.id == 0) {
			var product = new Product()
		} else {
			var product = await Product.find(params.id)
		}

		try {
			product.merge(productData)
			await product.save()
		} catch (e) {
			console.log('there was an error')
			console.log(e)
		} finally {
			// If PICTURE_1 is changed (then clientName is name of new downloaded image on client site)
			if (picture_1.clientName) {
				const fileName = 'product-' + product.id + '-pic_1.' + picture_1.subtype
				// Check if file not already exist and delete it before copuying the new one
				fs.exists(Helpers.publicPath('images/products/' + product.id + '/' + fileName), function(exists) {
					if (exists) {
						fs.unlinkSync(Helpers.publicPath('images/products/' + product.id + '/' + fileName))
					}
				})
				await picture_1.move(Helpers.publicPath('images/products/' + product.id), { name: fileName })
				if (!picture_1.moved()) {
					return picture_1.error()
				}
				product.picture_1 = appRoot + '/images/products/' + product.id + '/' + fileName
			}

			// If PICTURE_2 is changed (then clientName is name of new downloaded image on client site)
			if (picture_2.clientName) {
				const fileName = 'product-' + product.id + '-pic_2.' + picture_2.subtype
				// Check if file not already exist and delete it before copuying the new one
				fs.exists(Helpers.publicPath('images/products/' + product.id + '/' + fileName), function(exists) {
					if (exists) {
						fs.unlinkSync(Helpers.publicPath('images/products/' + product.id + '/' + fileName))
					}
				})
				await picture_2.move(Helpers.publicPath('images/products/' + product.id), { name: fileName })
				if (!picture_2.moved()) {
					return picture_2.error()
				}
				product.picture_2 = appRoot + '/images/products/' + product.id + '/' + fileName
			}

			// If PICTURE_3 is changed (then clientName is name of new downloaded image on client site)
			if (picture_3.clientName) {
				const fileName = 'product-' + product.id + '-pic_3.' + picture_3.subtype
				// Check if file not already exist and delete it before copuying the new one
				fs.exists(Helpers.publicPath('images/products/' + product.id + '/' + fileName), function(exists) {
					if (exists) {
						fs.unlinkSync(Helpers.publicPath('images/products/' + product.id + '/' + fileName))
					}
				})
				await picture_3.move(Helpers.publicPath('images/products/' + product.id), { name: fileName })
				if (!picture_3.moved()) {
					return picture_3.error()
				}
				product.picture_3 = appRoot + '/images/products/' + product.id + '/' + fileName
			}

			// If PICTURE_4 is changed (then clientName is name of new downloaded image on client site)
			if (picture_4.clientName) {
				const fileName = 'product-' + product.id + '-pic_4.' + picture_4.subtype
				// Check if file not already exist and delete it before copuying the new one
				fs.exists(Helpers.publicPath('images/products/' + product.id + '/' + fileName), function(exists) {
					if (exists) {
						fs.unlinkSync(Helpers.publicPath('images/products/' + product.id + '/' + fileName))
					}
				})
				await picture_4.move(Helpers.publicPath('images/products/' + product.id), { name: fileName })
				if (!picture_4.moved()) {
					return picture_4.error()
				}
				product.picture_4 = appRoot + '/images/products/' + product.id + '/' + fileName
			}

			// If PICTURE_5 is changed (then clientName is name of new downloaded image on client site)
			if (picture_5.clientName) {
				const fileName = 'product-' + product.id + '-pic_5.' + picture_5.subtype
				// Check if file not already exist and delete it before copuying the new one
				fs.exists(Helpers.publicPath('images/products/' + product.id + '/' + fileName), function(exists) {
					if (exists) {
						fs.unlinkSync(Helpers.publicPath('images/products/' + product.id + '/' + fileName))
					}
				})
				await picture_5.move(Helpers.publicPath('images/products/' + product.id), { name: fileName })
				if (!picture_5.moved()) {
					return picture_5.error()
				}
				product.picture_5 = appRoot + '/images/products/' + product.id + '/' + fileName
			}

			// If PICTURE_6 is changed (then clientName is name of new downloaded image on client site)
			if (picture_6.clientName) {
				const fileName = 'product-' + product.id + '-pic_6.' + picture_6.subtype
				// Check if file not already exist and delete it before copuying the new one
				fs.exists(Helpers.publicPath('images/products/' + product.id + '/' + fileName), function(exists) {
					if (exists) {
						fs.unlinkSync(Helpers.publicPath('images/products/' + product.id + '/' + fileName))
					}
				})
				await picture_6.move(Helpers.publicPath('images/products/' + product.id), { name: fileName })
				if (!picture_6.moved()) {
					return picture_6.error()
				}
				product.picture_6 = appRoot + '/images/products/' + product.id + '/' + fileName
			}

			// Save product again to save picture paths
			await product.save()
			session.flash({
				notification: {
					type: 'success',
					message: antl.formatMessage('products.product_success')
				}
			})
			return response.redirect('/my-products')
		}
	}
}

module.exports = ProductController
