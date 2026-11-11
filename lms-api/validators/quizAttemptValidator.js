const { z } = require("zod")

const answerSchema = z.object({
    questionId: z.string().trim().min(1, "question ID is required"),
    choiceId: z.string().trim().min(1, "choice ID is required")
}).strict()

const submitQuizAttemptSchema = z.object({
    answers: z.array(answerSchema)
}).strict()

module.exports = { submitQuizAttemptSchema }