require("dotenv").config(); //importing dotenv to use environment variables
const express = require("express");
const router = express.Router();
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authorise = require("../middleware/authorisationMiddleware.js");
const generateToken = require("../utils/generateToken.js");

//create route for getting users role

//route ro creating user
router.post("/registration", async (req, res) => {
  try {
    const { username, firstName, lastName, email, age, password, role } = req.body; //taking data from body request
    const salt = await bcrypt.genSalt(10); //generating salt for hashing
    const hashedPassword = await bcrypt.hash(password, salt); //hashing the password
    const newUser = new User({
      username,
      firstName,
      lastName,
      email,
      age,
      password: hashedPassword,
      role,
      houseID: null,
    }); //creating instance of user
    await newUser.save(); //saving user to db
    res.status(201).json({
      token: generateToken(newUser.userID, newUser.houseID, newUser.role), //sending token to client
    }); //response for created user
    console.log("New user created: " + newUser); //logging if user created
    console.log(
      "Token generated: " + generateToken(newUser.userID, newUser.houseID, newUser.role)
    ); //logging if token generated
  } catch (error) {
    res.status(500).json({ error: error.message }); //response for error
    console.log("Error creating user: " + error); //logging if error
  }
});

//route to retrieve all users
router.get("/users", authorise, async (req, res) => {
  try {
    const users = await User.find(); //fetching all users from db
    res.json(users); //send the users as a json response
  } catch (error) {
    res.status(500).json({ error: error.message }); //response for an error
  }
});

//route to retieve a specific user
router.get("/user", authorise, async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.user.userID }); //fetching a user by username from db
    if (!user) {
      //if user not found
      return res.status(404).json({ message: "User not found" }); //response for user not found
    }
    res.json({user: user.username}); //send the user as a json response
  } catch (error) { 
    res.status(500).json({ error: error.message }); //response for an error
  }
});

//route to retieve a specific user
router.get("/user/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }); //fetching a user by username from db
    if (!user) { 
      //if user not found
      return res.status(404).json({ message: "User not found" }); //response for user not found
    }
    res.json(user); //send the user as a json response
  } catch (error) {
    res.status(500).json({ error: error.message }); //response for an error
  }
});

//route to retieve a specific user by userID
router.get("/user/id/:userID", async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.params.userID }); //fetching a user by userID from db
    if (!user) {
      //if user not found
      return res.status(404).json({ message: "User not found" }); //response for user not found
    }
    res.json(user); //send the user as a json response
  } catch (error) {
    res.status(500).json({ error: error.message }); //response for an error
  }
});

//route to handle user login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body; //taking username and password from body request
    const user = await User.findOne({ username }); //fetching a user by username from db
    if (!user) {
      //if user not found
      return res.status(404).json({ message: "User not found" }); //response for user not found
    }

    const isMatch = await bcrypt.compare(password, user.password); //checking if password matches

    if (!isMatch) {
      //if password does not match
      return res.status(400).json({ message: "Invalid credentials" }); //response for invalid credentials
    }

	if(user.houseID == null){
     return res.json({ message: "RHP" }); //response for invalid credentials
	}

    const token = generateToken(user.userID, user.houseID, user.role); //generating token
    res.json({token}); //send the user as a json response

  } catch (error) {
    res.status(500).json({ error: error.message }); //response for an error
  }
});

//route to update a user
router.put("/user/:username", async (req, res) => {
  try {
    const { houseID } = req.body; // Only updating houseID
    const updatedUser = { houseID }; //creating new updated user
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      updatedUser,
      { new: true }
    ); //updating previous user by username from db
    if (!user) {
      //if user not found
      return res.status(404).json({ message: "User not found" }); //response for user not found
    }
    res.json(user); //send the updated user as a json response
  } catch (error) {
    res.status(500).json({ error: error.message }); //error response
  }
});

//route to delete user
router.delete("/user/:username", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ username: req.params.username }); //deleting a user by id from db
    if (!user) {
      //if user not found
      return res.status(404).json({ message: "User not found" }); //response for user not found
    }
    res.json(user); //send the deleted user as a json response
  } catch (error) {
    res.status(500).json({ error: error.message }); //error response
  }
});

module.exports = router; //exporting the routes
 