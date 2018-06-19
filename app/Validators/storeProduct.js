const antl = use('Antl')

'use strict'

class storeProduct {

    get validateAll() {
        return true
    }

    get rules() {
        return {
            'loan_or_rent': 'required',
            'pors': 'required',
            'group': 'required_if:pors',
            'category': 'required_if:group',
            'sub_category': 'required_if:category',
            'title': 'required|max:30',
            'sub_title': 'required|max:60',
            'description': 'required|min:10|max:200',
            'warranty_amount': 'required_if:is_warranty',
            'warranty_description': 'max:200|required_if:is_warranty',
            'home_delivery_amount': 'required_if:is_home_delivery',
            'home_delivery_description': 'max:200|required_if:is_home_delivery',
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
                message: antl.forLocale(locale).formatMessage('messages.product_validation_nok')
            }
        })
        return this.ctx.response.redirect('back')
    }
}

module.exports = storeProduct
