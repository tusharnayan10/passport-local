const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

async function initialize(passport, getUserByEmail, getUserByID) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);
        if (user == null) {
            return done(null, false, { message: 'No user with this email found!' });
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect Password!' });
            }
        }
        catch (err) {
            return done(err);
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    // use static serialize and deserialize of model for passport session support
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
       return done(null, getUserByID(id))
    });
}



module.exports = initialize