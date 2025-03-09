const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');
 
//Defining the schema for a memo. (This is not done and was more of a test to see how it works and how its saving to the db)
const memoSchema = new mongoose.Schema({
  memoID: {
    type: String,
    require: true,
    unique: true,
    default: uuidv4
  },
  title: {
    type: String,
    require: true
  },
  content:{ 
    type : String,
    require: true 
  },
  houseID: {
    type: String,
    require : true,
    ref: 'House'
    },
    userID: {
        type: String,
        require : true,
        ref: 'User'
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
 
});

module.exports = mongoose.model('Memo', memoSchema);//exporting model to be used in routes

//userID? generate on create
//house ID (ref both)
//