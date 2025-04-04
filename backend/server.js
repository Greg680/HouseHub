require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');


//Mongoose connection
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
const memosRoutes = require('./routes/memosRoutes');//importing file
const userRoutes = require('./routes/userRoutes');//importing file
const houseRoutes = require('./routes/houseRoutes');//importing file
const billTrackerRoutes = require('./routes/billTrackerRoutes');//importing file
const setupSocket = require('./socket/socket.js'); //importing socket file
const todolistRoutes = require('./routes/todolistRoutes');//importing file  
const schedulerRoutes = require('./routes/schedulerRoutes');//importing file


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

// for multer
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//the defined routes are accessable through http://localhost:5001/api/memo
app.use('/api/memo', memosRoutes);

app.use('/api/user', userRoutes);

app.use('/api/house', houseRoutes);

app.use('/api/bills', billTrackerRoutes);

app.use('/api/todolist', todolistRoutes);

app.use('/api/scheduler', schedulerRoutes);

// Catch-all route to serve the React app for non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

// Start the server

const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});




