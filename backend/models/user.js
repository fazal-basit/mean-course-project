const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Defining the Schema. It's just a blue print
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

// Creating mongoose model
module.exports = mongoose.model('User', userSchema);