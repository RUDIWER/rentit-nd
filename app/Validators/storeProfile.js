const antl = use('Antl')

'use strict'

class storeProfile {

    get validateAll() {
        return true
    }

    get rules() {
        return {
            'first_name': 'required|max:30',
            'last_name': 'required|max:30',
            'birthday': 'required|max:10',
            'nationality': 'required|max:30',
            'addr1_street': 'required|max:40',
            'addr1_housenr': 'required|max:10',
            'addr1_bus': 'max:10',
            'addr1_postcode': 'required|max:20',
            'addr1_city': 'required|max:30',
            'addr1_country': 'required|max:30',
            'phone_1': 'max:20',
            'mobile_1': 'max:20',
            'fax_1': 'max:20',
            'vat_number': 'max:20',
            'company_name': 'max:30|required_if:vat_number',
            'company_addr_street': 'max:40|required_if:vat_number',
            'company_addr_housenr': 'max:10|required_if:vat_number',
            'company_addr_bus': 'max:10',
            'company_addr_postcode': 'max:20|required_if:vat_number',
            'company_addr_city': 'max:30|required_if:vat_number',
            'company_addr_country': 'max:30|required_if:vat_number'
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

module.exports = storeProfile
