const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

function initialise(passport, getUserByUsername) {
    const authenticateUser = async (username, password, done ) => {
        const user = getUserByUsername(username)
        if (user == null) {
            return done(null, false, {message: 'No user found'})
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
    } else {
        return done(null, false, {message: 'No user found'})}

    } catch (e) {
        return done(e)
    }
}
    passport.use(new LocalStrategy({ usernameField: 'username'}, authenticateUser))
    passport.serializeUser((user, done) => user.id)
    passport.deserializeUser((id, done) => {})
        }

module.exports = initialise