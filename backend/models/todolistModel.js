const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');

const todolistschema = new mongoose.Schema({

    // houseid, userid, content, createdate, duedate, completedate, createuser, completeuser, status, taskid
    //filter by date
    //CRUD
    //
    houseID: {
            type: String,
            required: true,
            default: uuidv4,
            unique: true,
            ref: 'House'
         },
      userID: {
             type: String,
             required: true,
             ref: 'User'
         },
      content:{ 
             type : String,
             required: true 
        },
      createDate: {
             type: Date,
             default: Date.now,
        },
      dueDate: {
            type: Date,
            required : true,
        },
      completeDate: {
            type: Date,
            required : true,
        },
       userID: {
            type: String,
            required : true,
        },
        completeUser: {
            type: String,
            required : true,
        },
        status: {
            type: Boolean,
            required : true,
        },
        taskID: {
            type: String,
            required : true,
        }        
    });

module.exports = mongoose.model('Todolist', todolistschema);
   