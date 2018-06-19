'use strict';

class LocaleController {
    changeLocale({ params, session, response }) {
        // Put choosen language in dropdown in Session parameter
        session.put('locale', params.locale);
        return response.redirect('back');
    }
}

module.exports = LocaleController;
