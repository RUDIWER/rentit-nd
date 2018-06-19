const antl = use('Antl')

'use strict'

class storeMessage {

    get validateAll() {
        return true
    }

    get rules () {
        return {
            'message_text': 'required|max:500',
        }
    }

    get messages() {
        const locale = this.ctx.antl._locale
        const messages = antl.forLocale(locale).list('validators')
        return (messages)
    }

    async fails(errorMessages) {
        const locale = this.ctx.antl._locale
        this.ctx.session.withErrors(errorMessages).flashAll()
        this.ctx.session.flash({
            notification: {
                type: 'danger',
                message: antl.forLocale(locale).formatMessage('messages.message_validation_nok')
            }
        })
        return this.ctx.response.redirect('back')
    }


}

module.exports = storeMessage
