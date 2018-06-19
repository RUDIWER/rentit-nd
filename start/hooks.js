'use strict'

const {hooks} = require('@adonisjs/ignitor')
const path = require('path')


/*
|--------------------------------------------------------------------------
| Laravel mix hook
|--------------------------------------------------------------------------
|
| This hook adds the `mix()` - versioning function of laravel to adonis views.
| See more about Adonis views hooks at:
| https://adonisjs.com/docs/4.0/views#_extending_views
| See more about Laravel mix at:
| https://laravel.com/docs/5.5/mix
|
*/

hooks.after.providersBooted(() => {
  const View = use('Adonis/Src/View')
  const Helpers = use('Helpers')
  const Env = use('Env')
  const Exception = use('Exception')

  View.global('mix', text => {
    if (!text) return
    const manifest = require(path.join(Helpers.publicPath(), 'mix-manifest.json'))
    return manifest[text]
  })

  View.global('APP_NAME', function () {
    return Env.get('APP_NAME')
  })

  View.global('MAIL_FROM', function () {
    return Env.get('MAIL_FROM')
  })

  View.global('appUrl', path => {
    const APP_URL = Env.get('APP_URL')
    if(path){
      path = APP_URL + '/' + path
    }else{
      path = APP_URL
    }
    return path
  })

  Exception.handle('InvalidSessionException', ( error, {response} )=>{
    return response.redirect('/login')
  })

})


