const antl = use('Antl')

'use strict'

class storeUser {

    get validateAll() {
        return true
    }

    get rules() {
        return {
            username: 'required|unique:users:username',
            email: 'required|email|unique:users:email',
            password: 'required|min:6|confirmed'
        }
    }

    get messages() {
        const locale = this.ctx.antl._locale
        const messages = antl.forLocale(locale).list('validators')
        return (messages)
    }

    async fails(errorMessages) {
        this.ctx.session.withErrors(errorMessages).flashAll()
        return this.ctx.response.redirect('back')
    }
}

module.exports = storeUser
