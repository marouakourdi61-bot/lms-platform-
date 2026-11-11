const Quiz = require("../models/Quiz")
const QuizAttempt = require("../models/QuizAttempt")
const { roles } = require("../consts/roles")
const { calculateQuizScore } = require("./quizScoringService")
const Course = require("../models/Course")
const Module = require("../models/Module")

const validateAnswersBelongToQuiz = (quiz, answers) => {
    for (const answer of answers) {
        const question = quiz.questions.find(
            (item) => item.id === answer.questionId
        )

        if (!question) {
            const error = new Error(
                `Question ${answer.questionId} does not belong to this quiz`
            )
            error.statusCode = 400
            throw error
        }

        const choiceExists = question.choices.some(
            (choice) => choice.id === answer.choiceId
        )

        if (!choiceExists) {
            const error = new Error(
                `Choice ${answer.choiceId} does not belong to question ${answer.questionId}`
            )
            error.statusCode = 400
            throw error
        }
    }
}

const submitQuizAttempt = async ({ quizId, learnerId, answers}) => {
    if(!Array.isArray(answers)) {
        const error = new Error("answers must be an array")
        error.statusCode = 400
        throw error
    }

    const quiz = await Quiz.findById(quizId)

    if(!quiz) {
        const error = new Error("Quiz not found")
        error.statusCode = 404
        throw error
    }

    validateAnswersBelongToQuiz(quiz, answers)

    const score = calculateQuizScore(quiz, answers)

    const attempt = await QuizAttempt.create({
        learner: learnerId,
        quiz: quiz._id,
        answers,
        ...score
    })

    return attempt
}

const getQuizAttempts = async ({ quizId, learnerId, role}) => {
    const quiz = await Quiz.findById(quizId)

    if(!quiz) {
        const error = new Error("quiz not found")
        error.statusCode = 404
        throw error
    }

    if(role === roles.LEARNER) {
        return QuizAttempt.find({
            quiz: quiz._id,
            learner: learnerId
        }).sort({createdAt: -1}).lean()
    }

    const module = await Module.findById(quiz.moduleId)

    if(!module) {
        const error = new Error("module not found")
        error.statusCode = 404
        throw error
    }

    const trainerOwnsCourse = await Course.exists({
        _id: module.course,
        trainer: learnerId
    })

    if(!trainerOwnsCourse) {
        const error = new Error("you are not allowed to view attempts for this course")
        error.statusCode = 403
        throw error
    }

    return QuizAttempt.find({
        quiz: quiz._id
    }).sort({createdAt: -1}).lean()
}

module.exports = { submitQuizAttempt, getQuizAttempts }
