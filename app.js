// app.js

// Import Node's built-in path module
const path = require('path');

// Import Express
const express = require('express');

// Import session middleware
const session = require('express-session');

// Import Sequelize-backed session store
const SequelizeStore = require('connect-session-sequelize')(
    session.Store
);

// Import our Sequelize database connection
const sequelize = require('./util/database');

// Import Sequelize models
const Product = require('./models/products');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const shopRoutes = require('./routes/shopRoutes');
const authRoutes = require('./routes/authRoutes');

// Import error controller
const errorController = require('./controllers/error');

// Create Express application
const app = express();


// --------------------------------------------------
// SESSION STORE
// --------------------------------------------------
//
// Instead of storing sessions inside Node's temporary
// MemoryStore, sessions are stored in MySQL through
// Sequelize.
//

const sessionStore = new SequelizeStore({
    db: sequelize
});


// --------------------------------------------------
// VIEW ENGINE
// --------------------------------------------------

app.set('view engine', 'ejs');
app.set('views', 'views');


// --------------------------------------------------
// GENERAL MIDDLEWARE
// --------------------------------------------------

// Parse form data
app.use(
    express.urlencoded({
        extended: false
    })
);

// Serve static files from /public
app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);


// --------------------------------------------------
// SESSION MIDDLEWARE
// --------------------------------------------------
//
// On each request:
//
// Browser sends session-ID cookie
//          ↓
// express-session
//          ↓
// Session loaded from MySQL
//          ↓
// req.session becomes available
//

app.use(
    session({

        // Used to sign the session-ID cookie.
        //
        // For now this is a development secret.
        // Later we will move secrets into environment
        // variables.
        secret: 'mercato-development-session-secret',

        // Do not repeatedly save sessions that
        // have not changed.
        resave: false,

        // Do not create/store empty sessions
        // unnecessarily.
        saveUninitialized: false,

        // Persist sessions in MySQL.
        store: sessionStore,

        // Session-ID cookie configuration.
        cookie: {

            // Prevent normal browser JavaScript
            // from accessing the cookie.
            httpOnly: true,

            // Provides useful cross-site protection
            // while remaining practical for this app.
            sameSite: 'lax'

            /*
                In production over HTTPS we would
                additionally use:

                    secure: true
            */
        }
    })
);


// --------------------------------------------------
// LOAD LOGGED-IN USER
// --------------------------------------------------
//
// Login stores:
//
//     req.session.userId
//
// But our controllers need the actual Sequelize
// User instance:
//
//     req.user
//
// Therefore:
//
// req.session.userId
//          ↓
// User.findByPk()
//          ↓
// req.user
//

app.use(async (req, res, next) => {

    try {

        // No authenticated user ID exists
        // in this session.
        if (!req.session.userId) {

            return next();

        }


        // Load the current user from MySQL.
        const user = await User.findByPk(
            req.session.userId
        );


        // Handle a stale session where the
        // referenced user no longer exists.
        if (!user) {

            return next();

        }


        // Attach the Sequelize User instance
        // to the current request.
        //
        // Controllers can now use:
        //
        // req.user.createProduct()
        // req.user.getProducts()
        // req.user.getCart()
        //
        req.user = user;

        next();

    } catch (err) {

        next(err);

    }

});


// --------------------------------------------------
// AUTHENTICATION STATE FOR EJS
// --------------------------------------------------
//
// res.locals values are automatically available
// inside every EJS template rendered during
// the current request.
//
// navigation.ejs can therefore use:
//
//     isAuthenticated
//
// to conditionally display:
//
// LOGGED OUT:
//     Shop | Login | Sign Up
//
// LOGGED IN:
//     Shop | Add Product | Cart | Logout
//
// --------------------------------------------------
// AUTHENTICATION STATE FOR EJS
// --------------------------------------------------
//
// These values become available automatically
// inside every EJS template.
//
// isAuthenticated:
//     Is someone logged in?
//
// currentUserId:
//     Which user is logged in?
//
// This allows views to display ownership-specific UI.
//

app.use((req, res, next) => {

    res.locals.isAuthenticated =
        req.session.isLoggedIn || false;

    res.locals.currentUserId =
        req.user ? req.user.id : null;

    next();

});


// --------------------------------------------------
// ROUTES
// --------------------------------------------------
//
// Middleware execution before routes:
//
// Request
//      ↓
// Session loaded
//      ↓
// Logged-in User loaded into req.user
//      ↓
// isAuthenticated exposed to EJS
//      ↓
// Routes
//

app.use('/admin', adminRoutes);

app.use(authRoutes);

app.use(shopRoutes);


// 404 handler must come AFTER all valid routes.
app.use(errorController.get404);


// --------------------------------------------------
// SEQUELIZE ASSOCIATIONS
// --------------------------------------------------


// ONE USER → MANY PRODUCTS
//
// Foreign key:
//
// products.userId
//

User.hasMany(Product);

Product.belongsTo(User);


// ONE USER → ONE CART
//
// Foreign key:
//
// carts.userId
//

User.hasOne(Cart);

Cart.belongsTo(User);


// MANY CARTS ↔ MANY PRODUCTS
//
// CartItem acts as the junction model.
//
// cartItems:
//
//     cartId
//     productId
//     quantity
//

Cart.belongsToMany(Product, {
    through: CartItem
});

Product.belongsToMany(Cart, {
    through: CartItem
});


// --------------------------------------------------
// DATABASE INITIALIZATION
// --------------------------------------------------

sequelize
    .sync()

    .then(() => {

        /*
            Users are now created through the real
            signup flow.

            Sessions are persisted in MySQL through
            connect-session-sequelize.

            No temporary User #1 is required anymore.
        */

        app.listen(3000, () => {

            console.log(
                'Mercato server running on http://localhost:3000'
            );

        });

    })

    .catch(err => {

        console.error(
            'Unable to start Mercato:',
            err
        );

    });



