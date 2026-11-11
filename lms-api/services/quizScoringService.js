function calculateQuizScore(privateQuiz, answers) {
    let correctCount = 0

    for(const question of privateQuiz.questions) {
        const answer = answers.find(
            (item) => item.questionId === question.id
        )

        if(answer && answer.choiceId === question.correctChoiceId) {
            correctCount ++
        }
    }

    const totalQuestions = privateQuiz.questions.length

    const scorePercent = totalQuestions === 0 
    ? 0 : Number(((correctCount / totalQuestions) * 100).toFixed(2))

    const passed = scorePercent >= privateQuiz.passingScore

    return {
        correctCount,
        totalQuestions, 
        scorePercent,
        passed
    }
}

module.exports = {calculateQuizScore}