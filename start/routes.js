'use strict'

const Route = use('Route')

// Home routes
Route.get('/', 'HomeController.index').as('home')
Route.post('/search-rent-results', 'HomeController.rentSearchResult').as('searchRentResult')
Route.get('/group-rent-results/:id', 'HomeController.groupSearchResult').as('groupRentResult')
Route.get('/category-rent-results/:id', 'HomeController.categorySearchResult').as('categoryRentResult')
Route.get('/sub-category-rent-results/:id', 'HomeController.subCategorySearchResult').as('subCategoryRentResult')

// Change locale route
Route.get('/locale/:locale', 'Locale/LocaleController.changeLocale').as('locale')

// Authentication Registration & Login
Route.get('register', 'Auth/RegisterController.showRegisterForm').middleware(['authenticated'])
Route.post('register', 'Auth/RegisterController.register').validator('storeUser').as('register')
Route.get('register/confirm/:token', 'Auth/RegisterController.confirmEmail')
Route.get('login', 'Auth/LoginController.showLoginForm').middleware(['authenticated'])
Route.post('login', 'Auth/LoginController.login').as('login')
Route.get('logout', 'Auth/AuthenticatedController.logout').as('logout').middleware(['auth'])
Route.get('password/reset', 'Auth/PasswordResetController.showLinkRequestForm')
Route.post('password/email', 'Auth/PasswordResetController.sendResetLinkEmail')
Route.get('password/reset/:token', 'Auth/PasswordResetController.showresetForm')
Route.post('password/reset', 'Auth/PasswordResetController.reset')

// Pofile
Route.get('profile/create', 'Profile/ProfileController.create').middleware(['auth'])
Route.get('profile/edit', 'Profile/ProfileController.edit').middleware(['auth'])
Route.post('profile', 'Profile/ProfileController.store').validator('storeProfile').middleware(['auth']).as('profile')

// Products
Route.get('my-products', 'Product/ProductController.index').middleware(['auth']).as('my-products')
Route.get('my-product/create', 'Product/ProductController.create').middleware(['auth'])
Route.get('my-product/edit/:id', 'Product/ProductController.edit').middleware(['auth'])
Route.get('my-product/delete/:id', 'Product/ProductController.delete').middleware(['auth'])
Route.post('my-product/:id', 'Product/ProductController.store').validator('storeProduct').middleware(['auth']).as('my-product')

//PRODUCT AJAX Routes
Route.get('/my-products/get-group/:id', 'Product/ProductController.ajaxGetGroup').middleware(['auth'])

// MESSAGES routes
Route.get('/message/create/:receiverId/:productId/:chainId', 'Message/MessageController.create').as('message.create').middleware(['auth'])
Route.get('/my-messages', 'Message/MessageController.list').as('message.list').middleware(['auth'])
Route.get('/my-message/edit/:id', 'Message/MessageController.edit').as('message.edit').middleware(['auth'])
Route.post('/message/send/:receiverId/:productId/:chainId', 'Message/MessageController.send').validator('storeMessage').as('message.send').middleware(['auth'])








