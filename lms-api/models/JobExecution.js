
const mongoose = require("mongoose");

const jobExecutionSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
      enum: [
        "inactiveLearnerReminder",
        "trainerSummary",
        "statsRefresh",
      ],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["running", "success", "failed"],
      required: true,
      default: "running",
    },

    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    finishedAt: {
      type: Date,
      default: null,
    },

    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model(
  "JobExecution",
  jobExecutionSchema
);
