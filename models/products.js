const products = [];

module.exports = class Product {

    constructor(id, title) {

    this.id = id;
    this.title = title;

}
   save() {

    if (this.id) {

        // Existing product → update it

        const productIndex = products.findIndex(

            product => product.id === this.id

        );

        products[productIndex] = this;

    } else {

        // New product → generate ID and add it

        this.id = Math.random().toString();

        products.push(this);

    }

}


    static update(id, newTitle) {

    const product = products.find(product => product.id === id);

    if (product) {
        product.title = newTitle;
    }
}

    static fetchAll() {

        return products;
    }

    static findById(id) {

        // Find and return the product with the matching ID
        return products.find(product => product.id === id);
    }

    static deleteById(id) {

    const productIndex = products.findIndex(

        product => product.id === id

    );

    if (productIndex >= 0) {

        products.splice(productIndex, 1);

    }

}

};