// middleware/is-auth.js

// --------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// --------------------------------------------------
//
// Protects routes that require a logged-in user.
//
// If no authenticated session exists:
//     → redirect to login
//
// If authenticated:
//     → continue to the next middleware/controller
//

module.exports = (req, res, next) => {

    if (!req.session.isLoggedIn) {

        return res.redirect('/login');

    }

    next();

};