'use strict'

const Env = use('Env')
const Database = use('Database')
const ProdCategory = use('App/Models/ProdCategory')
const Product = use('App/Models/Product')

class HomeController {
	async index({ view, session, auth }) {
		const googleMapsApi = Env.get('GOOGLE_MAPS_API')
		// Check if logged in USer
		const user = await auth.getUser()
		const porses = (await ProdCategory.query().where('parent_category_id', '=', 0).fetch()).toJSON()
		if (!user) {
			return view.render('home', { porses })
		}

		const profile = await user.profile().fetch()
		return view.render('home', { profile, porses, googleMapsApi })
	}

	async groupSearchResult({ view, params, session, auth }) {
		const categories = (await ProdCategory.all()).toJSON()
		const user = await auth.getUser()
		const profile = await user.profile().fetch()
		var productResults = await Product.query()
			.join('users', 'products.user_id', '=', 'users.id')
			.join('profiles', 'products.user_id', '=', 'profiles.user_id')
			.where('group', '=', params.id)
		return view.render('product.productGrid', {
			profile,
			productResults,
			categories
		})
	}

	async categorySearchResult({ view, params, session, auth }) {
		const categories = (await ProdCategory.all()).toJSON()
		const user = await auth.getUser()
		const profile = await user.profile().fetch()
		var productResults = await Product.query()
			.join('users', 'products.user_id', '=', 'users.id')
			.join('profiles', 'products.user_id', '=', 'profiles.user_id')
			.where('category', '=', params.id)
		return view.render('product.productGrid', {
			profile,
			productResults,
			categories
		})
	}

	async subCategorySearchResult({ view, params, session, auth }) {
		const categories = (await ProdCategory.all()).toJSON()
		const user = await auth.getUser()
		const profile = await user.profile().fetch()
		var productResults = await Product.query()
			.join('users', 'products.user_id', '=', 'users.id')
			.join('profiles', 'products.user_id', '=', 'profiles.user_id')
			.where('sub_category', '=', params.id)
		return view.render('product.productGrid', {
			profile,
			productResults,
			categories
		})
	}

	async rentSearchResult({ view, request, response, session, auth }) {
		// VALIDATE FORM !!!!!!!!!!!!!!!!!!!!!!!!!!!
		// Flash old values to the session
		session.flashAll()
		// Get categories needed for breadcrumbs
		const categories = (await ProdCategory.all()).toJSON()
		// Get ProductData data from form
		const formData = request.except([ '_csrf', 'submit' ])
		//    return formData
		// Get User_id of logged in user to store in profile
		const user = await auth.getUser()
		const profile = await user.profile().fetch()
		const what = formData.search_what
		var radius = formData.search_dist
		const pors = formData.search_pors
		var city = ''
		// City Is in formData when there was a google place locartion found in the form and select
		if (formData.city) {
			city = formData.city
			// IF another location was typed in the field and not verified by google it comes as Search_where
		} else {
			city = formData.search_where
			// radius = 0
		}
		const postcode = formData.postcode
		const latitude = formData.latitude
		const longitude = formData.longitude
		var productResults = ''
		// (RW) If postcode come with Gmaps loacation  make search on postcode if not make search on city field !
		if (postcode && radius === 0) {
			console.log(1)
			productResults = await Product.query()
				.join('users', 'products.user_id', '=', 'users.id')
				.join('profiles', 'products.user_id', '=', 'profiles.user_id')
				.where('addr1_postcode', '=', postcode)
				.where('pors', '=', pors)
				.where('title', 'LIKE', '%' + what + '%')
				.orWhere('description', 'LIKE', '%' + what + '%')
				.orWhere('sub_title', 'LIKE', '%' + what + '%')
		} else if (city && radius === 0) {
			console.log(2)
			productResults = await Product.query()
				.join('users', 'products.user_id', '=', 'users.id')
				.join('profiles', 'products.user_id', '=', 'profiles.user_id')
				.where('addr1_city', '=', city)
				.where('pors', '=', pors)
				.where('title', 'LIKE', '%' + what + '%')
				.orWhere('description', 'LIKE', '%' + what + '%')
				.orWhere('sub_title', 'LIKE', '%' + what + '%')
		} else if (radius > 0 && radius < 999) {
			console.log(3)
			console.log(longitude, latitude)
			productResults = await Product.query()
				.join('users', 'products.user_id', '=', 'users.id')
				.join('profiles', 'products.user_id', '=', 'profiles.user_id')
				.whereRaw('(ST_DISTANCE_SPHERE(POINT(geo_longitude, geo_latitude),POINT(?, ?)) / 1000) < ?', [
					longitude,
					latitude,
					radius
				])
				.where('pors', '=', pors)
				.where('title', 'LIKE', '%' + what + '%')
				.orWhere('description', 'LIKE', '%' + what + '%')
				.orWhere('sub_title', 'LIKE', '%' + what + '%')
		} else {
			console.log(4)

			// Proberen met lucid querybuilder
			// await Products.query().with('users').fetch()

			productResults = await Database.select('prd.*', 'usr.*', 'prf.*', 'prd.id as product_id')
				.from('products as prd')
				.join('users as usr', 'prd.user_id', '=', 'usr.id')
				.join('profiles as prf', 'prd.user_id', '=', 'prf.user_id')
				.where('prd.pors', '=', pors)
				.where('title', 'LIKE', '%' + what + '%')
				.orWhere('description', 'LIKE', '%' + what + '%')
				.orWhere('sub_title', 'LIKE', '%' + what + '%')
		}
		return view.render('product.productGrid', {
			profile,
			productResults,
			categories
		})
	}
}

module.exports = HomeController
