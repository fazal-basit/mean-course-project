const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect("mongodb://localhost:27017/postDatabase")
.then(() => {
    console.log('Connected to database');
})
.catch(() => {
    console.log('Connection Failed!');
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use("/images", express.static(path.join("backend/images")));


app.use((req, res,next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", 
    "GET, POST, PATCH, DELETE, OPTIONS, PUT");
    next();
});

app.use("/api/posts" ,postsRoutes);
app.use("/api/user", userRoutes);

module.exports = app;

