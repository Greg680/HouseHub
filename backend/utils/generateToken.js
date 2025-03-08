const jwt = require("jsonwebtoken");

const generateToken = (userID, houseID, role) => {
    return jwt.sign({ userID, houseID, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generateToken; 