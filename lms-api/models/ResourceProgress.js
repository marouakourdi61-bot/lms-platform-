const mongoose = require("mongoose");

const resourceProgressSchema = new mongoose.Schema(
    {
        learner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        resource: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
            required: true
        },

        consulted: {
            type: Boolean,
            default: false
        },

        consultedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

resourceProgressSchema.index(
    { learner: 1, resource: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "ResourceProgress",
    resourceProgressSchema
);