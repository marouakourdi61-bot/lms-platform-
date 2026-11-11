const mongoose = require("mongoose");

const moduleProgressSchema = new mongoose.Schema({
    learner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
        required: true
    },

    status: {
        type: String,
        enum: ["in_progress", "completed"],
        default: "in_progress"
    },


    completedAt: {
        type: Date,
        default: null
    }


},
    {
        timestamps: true
    }
);


moduleProgressSchema.index(
    { learner: 1, module: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "ModuleProgress",
    moduleProgressSchema

);