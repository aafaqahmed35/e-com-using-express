// controllers/authController.js

// Import bcrypt for password hashing and verification
const bcrypt = require('bcrypt');

// Import User model
const User = require('../models/user');


// --------------------------------------------------
// GET SIGNUP
// --------------------------------------------------
//
// Displays the signup page.
//

exports.getSignup = (req, res, next) => {

    res.render('auth/signup', {

        pageTitle: 'Sign Up',

        path: '/signup'

    });

};


// --------------------------------------------------
// POST SIGNUP
// --------------------------------------------------
//
// Creates a new user account.
//
// Flow:
//
// form data
//     ↓
// check existing email
//     ↓
// hash password
//     ↓
// create User
//     ↓
// create Cart
//     ↓
// redirect to login
//

exports.postSignup = async (req, res, next) => {

    try {

        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;


        // ------------------------------------------
        // CHECK WHETHER EMAIL ALREADY EXISTS
        // ------------------------------------------

        const existingUser = await User.findOne({

            where: {
                email: email
            }

        });


        if (existingUser) {

            console.log(
                'A user with this email already exists.'
            );

            return res.redirect('/signup');

        }


        // ------------------------------------------
        // HASH PASSWORD
        // ------------------------------------------

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );


        // ------------------------------------------
        // CREATE USER
        // ------------------------------------------

        const user = await User.create({

            name: name,

            email: email,

            // Store HASH — never plaintext password.
            password: hashedPassword

        });


        // ------------------------------------------
        // CREATE USER'S CART
        // ------------------------------------------
        //
        // Because:
        //
        // User.hasOne(Cart)
        //
        // Sequelize gives us:
        //
        // user.createCart()
        //

        await user.createCart();


        // Account exists.
        // User can now log in.

        res.redirect('/login');

    } catch (err) {

        next(err);

    }

};


// --------------------------------------------------
// GET LOGIN
// --------------------------------------------------

exports.getLogin = (req, res, next) => {

    res.render('auth/login', {

        pageTitle: 'Login',

        path: '/login'

    });

};


// --------------------------------------------------
// POST LOGIN
// --------------------------------------------------
//
// Flow:
//
// email
//     ↓
// find User
//     ↓
// bcrypt.compare()
//     ↓
// regenerate session
//     ↓
// store authenticated userId
//     ↓
// save session
//     ↓
// redirect
//

exports.postLogin = async (req, res, next) => {

    try {

        const email = req.body.email;
        const password = req.body.password;


        // ------------------------------------------
        // FIND USER
        // ------------------------------------------

        const user = await User.findOne({

            where: {
                email: email
            }

        });


        if (!user) {

            console.log(
                'Invalid email or password.'
            );

            return res.redirect('/login');

        }


        // ------------------------------------------
        // VERIFY PASSWORD
        // ------------------------------------------

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatches) {

            console.log(
                'Invalid email or password.'
            );

            return res.redirect('/login');

        }


        // ------------------------------------------
        // REGENERATE SESSION
        // ------------------------------------------
        //
        // We replace the pre-login session identifier
        // before establishing authenticated state.
        //

        req.session.regenerate(err => {

            if (err) {

                return next(err);

            }


            // --------------------------------------
            // ESTABLISH AUTHENTICATED STATE
            // --------------------------------------

            req.session.isLoggedIn = true;

            req.session.userId = user.id;


            // --------------------------------------
            // SAVE BEFORE REDIRECT
            // --------------------------------------

            req.session.save(err => {

                if (err) {

                    return next(err);

                }

                res.redirect('/');

            });

        });

    } catch (err) {

        next(err);

    }

};


// --------------------------------------------------
// POST LOGOUT
// --------------------------------------------------

exports.postLogout = (req, res, next) => {

    req.session.destroy(err => {

        if (err) {

            return next(err);

        }


        /*
            Clear the default express-session cookie.

            The default cookie name is:

                connect.sid
        */

        res.clearCookie('connect.sid');


        res.redirect('/');

    });

};