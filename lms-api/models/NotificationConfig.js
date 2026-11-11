const mongoose = require("mongoose");

const notificationConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global",
      immutable: true,
    },

    notifications: {
      enabled: {
        type: Boolean,
        default: true,
      },
      emailDriver: {
        type: String,
        enum: ["log", "sandbox", "smtp"],
        default: "log",
      },
    },

    jobs: {
      inactiveLearnerReminder: {
        enabled: { type: Boolean, default: false },
        frequency: { type: String, default: "0 9 * * *" },
        inactiveDays: { type: Number, min: 1, default: 7 },
      },

      trainerSummary: {
        enabled: { type: Boolean, default: false },
        frequency: { type: String, default: "0 10 * * 1" },
      },

      statsRefresh: {
        enabled: { type: Boolean, default: false },
        frequency: { type: String, default: "0 * * * *" },
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model(
  "NotificationConfig",
  notificationConfigSchema
);