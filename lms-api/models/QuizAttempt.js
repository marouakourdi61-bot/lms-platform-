const mongoose = require("mongoose")

const quizAttempt = new mongoose.Schema(
{
    learner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },

    correctCount: {
        type: Number,
        required: true,
        min: 0
    },

    totalQuestions: {
        type: Number,
        required: true,
        min: 1
    },

    scorePercent: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },

    passed: {
        type: Boolean,
        required: true
    },

    answers: {
        type: [
            {
                questionId: {
                    type: String,
                    required: true
                },
                choiceId: {
                    type: String,
                    required: true
                }
            }
        ],
        required: true,
        default: []
    }
},
    {
        timestamps: true
    }
)

quizAttempt.index({ learner: 1, quiz: 1, createdAt: -1 })

module.exports = mongoose.model("QuizAttempt", quizAttempt)
