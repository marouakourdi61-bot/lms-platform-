const { 
    submitQuizAttempt: createQuizAttempt,
    getQuizAttempts: fetchQuizAttempts

} = require("../services/quizAttemptService")

const submitQuizAttempt = async(req, res, next) => {
    try {
        const attempt = await createQuizAttempt({
            quizId: req.params.quizId,
            learnerId: req.user.id,
            answers: req.body.answers
        })

        res.status(201).json({
            status: 201,
            message: "quiz attempt submitted successfully",
            data: attempt
        })
    } catch (error) {
        next(error)
    }
}

const getQuizAttempts = async (req, res, next) => {
    try {
        const attempts = await fetchQuizAttempts({
            quizId: req.params.quizId,
            learnerId: req.user.id,
            role: req.user.role
        })

        res.status(200).json({
            status: 200,
            message: "quiz attempts retrieved successfully",
            data: attempts
        })
    } catch(error) {
        next(error)
    }
}

module.exports = { submitQuizAttempt, getQuizAttempts }