const mongoose = require("mongoose");

const choiceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  _id: false,
});

module.exports = choiceSchema;
