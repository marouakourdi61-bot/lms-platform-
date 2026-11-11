const mongoose = require("mongoose");
const questionSchema = require("./schemas/questionSchema");

const quizSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
    required: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
  passingScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  questions: {
    type: [questionSchema],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Quiz", quizSchema);
