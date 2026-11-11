const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        learner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active"
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    {
        timestamps: true
    }
);

enrollmentSchema.index(
    { learner: 1, course: 1 },
    { unique: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);