// models/user.js

// Import Sequelize
const Sequelize = require('sequelize');

// Import our configured Sequelize database connection
const sequelize = require('../util/database');


// --------------------------------------------------
// USER MODEL
// --------------------------------------------------

const User = sequelize.define('user', {

    // Primary key
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },


    // User's display name
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },


    // User's email address
    //
    // unique: true creates a database-level uniqueness
    // constraint so two users cannot use the same email.
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },


    // User's password HASH
    //
    // IMPORTANT:
    // We will NEVER store the plaintext password here.
    //
    // During signup:
    //
    // plaintext password
    //      ↓
    // bcrypt.hash()
    //      ↓
    // bcrypt hash
    //      ↓
    // this field
    //
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }

});


// Export the model
module.exports = User;