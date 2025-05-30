const mongoose = require("mongoose");

// Define the User schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
  },
  contactNo: {
    type: String,
  },
  barangay: {
    type: String,
  },
  purok: {
    type: String,
  },
  status: {
    type: Number,
  },
  dateRegistered: {
    type: Date,
  },
});

// Create the User model
const Users = mongoose.model("Users", UserSchema);

module.exports = Users;
