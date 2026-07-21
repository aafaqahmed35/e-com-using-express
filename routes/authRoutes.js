// routes/authRoutes.js

// Import Express
const express = require('express');

// Import authentication controller
const authController = require(
    '../controllers/authController'
);

// Create router
const router = express.Router();


// --------------------------------------------------
// SIGNUP
// --------------------------------------------------

router.get(
    '/signup',
    authController.getSignup
);

router.post(
    '/signup',
    authController.postSignup
);


// --------------------------------------------------
// LOGIN
// --------------------------------------------------

router.get(
    '/login',
    authController.getLogin
);

router.post(
    '/login',
    authController.postLogin
);


// --------------------------------------------------
// LOGOUT
// --------------------------------------------------
//
// Logout changes authentication state,
// therefore we use POST rather than GET.
//

router.post(
    '/logout',
    authController.postLogout
);


// Export router
module.exports = router;