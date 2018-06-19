'use strict'

class Authenicated {
    async handle({ request, auth, response }, next) {
        try {
            await auth.check()
            return response.route('home')
        } catch (error) {
            await next()
        }
    }
}

module.exports = Authenicated
