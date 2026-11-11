const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        order: {
            type: Number,
            required: true
        },

        estimatedDuration: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft"
        }
    },
    {
        timestamps: true
    }
);

moduleSchema.index(
    { course: 1, order: 1 },
    { unique: true }
);

module.exports = mongoose.model("Module", moduleSchema);