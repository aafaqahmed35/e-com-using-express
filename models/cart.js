const cart=[];

module.exports=class Cart{

    static addProduct(product){
        cart.push(product);
    }

    static getProducts(){
        return cart;
    }
};



