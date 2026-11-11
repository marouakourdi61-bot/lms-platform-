const mongoose = require("mongoose");
const choiceSchema = require("./choiceSchema");

const questionSchema = new mongoose.Schema({
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
  choices: {
    type: [choiceSchema],
  },
  correctChoiceId: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  _id: false,
});

module.exports = questionSchema;
