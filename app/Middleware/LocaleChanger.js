const antl = use('Antl')

'use strict'

class LocaleChanger {
    async handle({ request, response, locale, params, session, antl }, next) {
        antl.switchLocale(session.get('locale'))
        await next()
    }
}

module.exports = LocaleChanger
