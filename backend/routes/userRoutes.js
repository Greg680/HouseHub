require("dotenv").config(); //importing dotenv to use environment variables
const express = require("express");
const router = express.Router();
const User = require("../models/userModel.js");
const House = require("../models/houseModel.js"); // Add this import to access the House model
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authorise = require("../middleware/authorisationMiddleware.js");
const generateToken = require("../utils/generateToken.js");
const upload = require("../middleware/multer");

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
      token: generateToken(newUser.userID, newUser.houseID), //sending token to client
    }); //response for created user
    console.log("New user created: " + newUser); //logging if user created
    console.log(
      "Token generated: " + generateToken(newUser.userID, newUser.houseID)
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
router.get("/user/welcome", authorise, async (req,res) => {
    try {
      const user = await User.findOne({ userID: req.user.userID});
      res.json({user: user.username});
    }catch(error){
      res.status(500).json({ error: error.message }); //response for an error
    }

    }

)

//route to retieve a specific user
router.get("/user", authorise, async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.user.userID }); //fetching a user by username from db
    if (!user) {
      //if user not found
      return res.status(404).json({ message: "User not found" }); //response for user not found
    }
    res.json({user: user}); //send the user as a json response
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

    const token = generateToken(user.userID, user.houseID, user.username); //generating token
    res.json({token}); //send the user as a json response

  } catch (error) {
    res.status(500).json({ error: error.message }); //response for an error
  }
});

//route to update a user
router.put("/user/:username", async (req, res) => {
  try {
    const { houseID } = req.body; // Only updating houseID
    const houseExists = await House.findOne({ houseID }); // Validate against the House collection
    if (!houseExists) {
      return res.status(400).json({ message: "Invalid houseID" }); // Respond if houseID does not exist
    }
    const updatedUser = { houseID }; // Creating new updated user
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

// Route to update specific user fields: firstName, lastName, email, and age
router.put("/user/updateFields/:username", async (req, res) => {
  try {
    const { firstName, lastName, email, age, userTheme } = req.body; // Extract fields from the request body
    const updatedFields = { firstName, lastName, email, age, userTheme }; // Create an object with the updated fields

    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      updatedFields,
      { new: true } // Return the updated user
    ); // Update the user in the database

    if (!user) {
      // If user not found
      return res.status(404).json({ message: "User not found" }); // Respond with user not found
    }
    res.json(user); // Send the updated user as a JSON response
  } catch (error) {
    res.status(500).json({ error: error.message }); // Respond with an error
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
// for image upload via multer
router.post(
  "/user/uploadProfileImage/:userID",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      console.log("Upload hit");
      console.log("req.params.userID:", req.params.userID);
      console.log("req.file:", req.file);
      const user = await User.findOneAndUpdate(
        { userID: req.params.userID },
        { profileImage: req.file.filename },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Image uploaded successfully", user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
router.put("/theme",  async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;

    const validThemes = [
      "default",
      "blue",
      "green",
      "red",
      "purple",
      "orange",
      "pink",
    ];

    if (!validThemes.includes(theme)) {
      return res.status(400).json({ message: "Invalid theme selected" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userTheme: theme },
      { new: true }
    );

    res.json({ message: "Theme updated", userTheme: updatedUser.userTheme });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router; //exporting the routes
