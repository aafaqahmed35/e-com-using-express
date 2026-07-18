const Product = require('../models/products');

exports.getAddProduct = (req, res, next) => {

    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product'
    });

};

exports.postAddProduct = (req, res, next) => {

    const title = req.body.title;

    const product = new Product(null,title);

    product.save();

    res.redirect('/');

};

exports.getEditProduct=(req,res,next)=>{
    
    const productId=req.params.productId; 
    const product=Product.findById(productId);

    console.log(product);

    res.render('admin/edit-product',{
        pageTitle: 'Edit Product',

        path: '/admin/edit-product',

        product: product}

    )
};

exports.postEditProduct = (req, res, next) => {

    // ID comes from the hidden input in edit-product.ejs
    const productId = req.body.productId;

    // Updated title comes from the visible input
    const updatedTitle = req.body.title;

    // Update the existing product directly
    Product.update(productId, updatedTitle);

    res.redirect('/');
};


exports.postDeleteProduct=(req,res,next)=>{

    const pid=req.params.productId;

    Product.deleteById(pid);

    res.redirect('/');
}




