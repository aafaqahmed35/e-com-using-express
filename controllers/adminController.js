// controllers/adminController.js


// --------------------------------------------------
// GET ADD PRODUCT PAGE
// --------------------------------------------------

exports.getAddProduct = (req, res, next) => {

    res.render('admin/add-product', {

        pageTitle: 'Add Product',

        path: '/admin/add-product'

    });

};


// --------------------------------------------------
// CREATE PRODUCT
// --------------------------------------------------

exports.postAddProduct = async (req, res, next) => {

    try {

        // Get submitted form data
        const title = req.body.title;

        const imageUrl = req.body.imageUrl;

        const price = parseFloat(req.body.price);

        const description = req.body.description;


        /*
            req.user is the currently authenticated
            Sequelize User instance.

            Because we defined:

                User.hasMany(Product)

            Sequelize gives us:

                req.user.createProduct()

            Creating through the authenticated user
            automatically establishes ownership:

                Logged-in User
                        ↓
                createProduct()
                        ↓
                products.userId = req.user.id
        */

        await req.user.createProduct({

            title: title,

            imageUrl: imageUrl,

            price: price,

            description: description

        });


        res.redirect('/');

    } catch (err) {

        next(err);

    }

};


// --------------------------------------------------
// GET EDIT PRODUCT PAGE
// --------------------------------------------------

exports.getEditProduct = async (req, res, next) => {

    try {

        // Product ID requested by the client.
        const productId = req.params.productId;


        /*
            IMPORTANT AUTHORIZATION CHECK

            We do NOT use:

                Product.findByPk(productId)

            because that would find ANY user's product.

            Instead, we search only inside the currently
            authenticated user's products.

            Conceptually:

                SELECT *
                FROM products
                WHERE id = productId
                  AND userId = req.user.id
        */

        const products = await req.user.getProducts({

            where: {

                id: productId

            }

        });


        // getProducts() returns an array.
        const product = products[0];


        /*
            If no product was returned, either:

            1. The product does not exist

            OR

            2. It exists but belongs to another user

            In either case, this user must not edit it.
        */

        if (!product) {

            return res.redirect('/');

        }


        res.render('admin/edit-product', {

            pageTitle: 'Edit Product',

            path: '/admin/edit-product',

            product: product

        });

    } catch (err) {

        next(err);

    }

};


// --------------------------------------------------
// UPDATE PRODUCT
// --------------------------------------------------

exports.postEditProduct = async (req, res, next) => {

    try {

        // Product ID submitted by the client.
        //
        // Never treat this ID itself as proof
        // that the user owns the product.

        const productId = req.body.productId;


        /*
            Find the product ONLY within the
            authenticated user's products.

            This performs the ownership authorization
            before allowing any modification.
        */

        const products = await req.user.getProducts({

            where: {

                id: productId

            }

        });


        const product = products[0];


        // Product missing OR owned by another user.
        if (!product) {

            return res.redirect('/');

        }


        // ------------------------------------------
        // UPDATE AUTHORIZED PRODUCT
        // ------------------------------------------

        product.title = req.body.title;

        product.imageUrl = req.body.imageUrl;

        product.price = parseFloat(req.body.price);

        product.description = req.body.description;


        // Persist changes to MySQL.
        await product.save();


        res.redirect('/');

    } catch (err) {

        next(err);

    }

};


// --------------------------------------------------
// DELETE PRODUCT
// --------------------------------------------------

exports.postDeleteProduct = async (req, res, next) => {

    try {

        // Product ID supplied through the URL.
        const productId = req.params.productId;


        /*
            Again, scope the database query through
            the authenticated user.

            Do NOT simply find any product by ID.

            Only a product owned by req.user can
            be returned here.
        */

        const products = await req.user.getProducts({

            where: {

                id: productId

            }

        });


        const product = products[0];


        // Product missing OR owned by another user.
        if (!product) {

            return res.redirect('/');

        }


        // Authorization succeeded.
        // This user owns the product.

        await product.destroy();


        res.redirect('/');

    } catch (err) {

        next(err);

    }

};




