const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true
    },

    type: {
      type: String,
      enum: ["video", "document", "image", "link"],
      required: true
    },

    url: {
      type: String,
      required: true
    },

    originalName: {
      type: String
    },

    size: {
      type: Number
    },

    order: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Resource", resourceSchema);
