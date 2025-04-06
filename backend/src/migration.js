const mongoose = require("mongoose");
const Bill = require("../models/billTrackerModel");
const User = require("../models/userModel");
require('dotenv').config();
const uri = process.env.MONGODB_URI;

const migrateUserIDs = async () => {
  try {
    await mongoose.connect(uri);

    const bills = await Bill.find();
    for (const bill of bills) {
      for (const payment of bill.paid) {
        if (typeof payment.userID === "string") {
          // Find the user by the UUID string
          const user = await User.findOne({ uuid: payment.userID }); // Assuming `uuid` is a field in your User model
          if (user) {
            payment.userID = user._id; // Replace the UUID with the ObjectId
          } else {
            console.warn(`User not found for userID: ${payment.userID}`);
          }
        }
      }
      await bill.save();
    }

    console.log("Migration complete");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error during migration:", error);
  }
};

migrateUserIDs();