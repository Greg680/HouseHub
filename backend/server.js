require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require('cors');

//Mongoose connection
const mongoose = require('mongoose');
const uri = "mongodb+srv://Admin:User@househubdb.8pvzl.mongodb.net/?retryWrites=true&w=majority&appName=HouseHubDB";
const memosRoutes = require('./routes/memosRoutes');//importing file
const userRoutes = require('./routes/userRoutes');//importing file
const houseRoutes = require('./routes/houseRoutes');//importing file
const billTrackerRoutes = require('./routes/billTrackerRoutes');//importing file
const todolistRoutes = require('./routes/todolistRoutes');//importing file  

//Imported routes
const memosRoutes = require('./routes/memosRoutes');
const userRoutes = require('./routes/userRoutes');
const houseRoutes = require('./routes/houseRoutes');
const billTrackerRoutes = require('./routes/billTrackerRoutes');



const app = express(); 

// Enable CORS
app.use(cors());

//Using mongoose to connect to MongoDB
async function connectToDB() { 

  try{
    await mongoose.connect(uri); //connect to MongoDB from the URI
    console.log("Connected to MongoDB"); //logging a successful connection
  } catch(error) {

    console.log("Error connecting to MongoDB: " + error);

  }
}
connectToDB();//calling function to connect

//Middleware to parse JSON
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, "..","client","build")));


// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});



//the defined routes are accessable through http://localhost:5001/api/memo
app.use('/api/memo', memosRoutes);

app.use('/api/user', userRoutes);

app.use('/api/house', houseRoutes);

app.use('/api/bills', billTrackerRoutes);
 
app.use('/api/todolist', todolistRoutes);
 

