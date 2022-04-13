const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose")
require("dotenv").config();

const port = 8020 || process.env.PORT ;


// Creating web app instance
const app = express()
app.use(cors())
app.use(express.json())

// Connecting to database, ATLAS is stored in environment variable
const uri = process.env.ATLAS;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', ()=>{
    console.log("Data Base Connected Successfully");
})

// connecting the routes
const feedbackRoutes = require("./routes/feedbackRoute");
app.use('/feedback', feedbackRoutes);
const configRoutes = require("./routes/configRoute");
app.use('/', configRoutes);

// startnig the server
app.listen(port, ()=>console.log(`Listining on port ${port}...`))
