// routes/adminRoutes.js

const express = require('express');

const adminController = require(
    '../controllers/adminController'
);

// Import authentication middleware
const isAuth = require(
    '../middleware/is-auth'
);

const router = express.Router();


// --------------------------------------------------
// PROTECT ALL ADMIN ROUTES
// --------------------------------------------------
//
// Every route declared BELOW this middleware
// requires an authenticated session.
//
// Request
//     ↓
// isAuth
//     ↓
// authenticated?
//     ↓
// admin route/controller
//

router.use(isAuth);


// --------------------------------------------------
// ADD PRODUCT
// --------------------------------------------------

// Display Add Product form
router.get(
    '/add-product',
    adminController.getAddProduct
);


// Create product
router.post(
    '/add-product',
    adminController.postAddProduct
);


// --------------------------------------------------
// EDIT PRODUCT
// --------------------------------------------------

// Display Edit Product form
router.get(
    '/edit-product/:productId',
    adminController.getEditProduct
);


// Save edited product
router.post(
    '/edit-product',
    adminController.postEditProduct
);


// --------------------------------------------------
// DELETE PRODUCT
// --------------------------------------------------

router.post(
    '/delete-product/:productId',
    adminController.postDeleteProduct
);


module.exports = router;
