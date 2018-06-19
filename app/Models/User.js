'use strict'

const Model = use('Model')

class User extends Model {


// Scopes

  static scopeHasProfile (query) {
    return query.has('profile')
  }

// RELATIONS 
  profile () {
    return this.hasOne('App/Models/Profile')
  }

  products () {
    return this.hasMany('App/Models/Product')
  }

// HOOOKS  
  static boot () {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     *
     * Look at `app/Models/Hooks/User.js` file to
     * check the hashPassword method
     */
    this.addHook('beforeCreate', 'User.hashPassword')
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token')
  }
}

module.exports = User
