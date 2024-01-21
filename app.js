const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const apiRoute = require("./routes/tools");
const userRoutes = require("./routes/auth");
const blogRoutes = require('./routes/blog');
const cartRoutes = require('./routes/cart');
  
dotenv.config();


mongoose.connect(process.env.MONGODB_URI)
  .then(result => {
    const server = app.listen(process.env.PORT || 5000);
    if(server){
        console.log("connected");
    }})
.catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({  crossOriginResourcePolicy: false}));
app.use(morgan("common"));


app.use(cors());

// app.use('/', (req, res) => {
//   res.write('API in Connected'); //write a response to the client
// })

app.use(apiRoute);
app.use(userRoutes);
app.use(blogRoutes);
app.use(cartRoutes);