const express= require('express');


const shopController=require('../controllers/shop');


const router=express.Router();

router.get('/',shopController.getIndex);
router.get('/products/:productId', shopController.getProduct);

router.post('/cart',shopController.postCart);
router.get('/cart',shopController.getCart)

module.exports=router;


