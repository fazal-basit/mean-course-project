const mongoose = require('mongoose');


// Defining the Schema. It's just a blue print
const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    extraInfo: {type: String, required: true},
    imagePath: { type: String, required: true },    
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

// Creating mongoose model
module.exports = mongoose.model('Post', postSchema);