const { privateQuiz, submission} = require("./quizData")
const { calculateQuizScore } = require("../services/quizScoringService")

test("calculating the score of quiz", () => {
    const result = calculateQuizScore(privateQuiz, submission.answers)

    expect(result).toEqual({
        correctCount: 2,
        totalQuestions: 3,
        scorePercent: 66.67,
        passed: true
    })
}) 

test("learner pass if score equal to passingScore", () => {
  const quizWithFiveQuestions = {
    ...privateQuiz,
    passingScore: 60,
    questions: [
      ...privateQuiz.questions,
      { id: "q4", correctChoiceId: "a" },
      { id: "q5", correctChoiceId: "a" },
    ],
  };

  const answersAtThreshold = [
    { questionId: "q1", choiceId: "b" }, 
    { questionId: "q2", choiceId: "a" }, 
    { questionId: "q3", choiceId: "b" }, 
    { questionId: "q4", choiceId: "b" },
    { questionId: "q5", choiceId: "b" },
  ];

  const result = calculateQuizScore(
    quizWithFiveQuestions,
    answersAtThreshold
  );

  expect(result).toEqual({
    correctCount: 3,
    totalQuestions: 5,
    scorePercent: 60,
    passed: true,
  });
});

test("learner fails if score down of passingScore", () => {
  const answersBelowThreshold = [
    { questionId: "q1", choiceId: "b" }, 
    { questionId: "q2", choiceId: "b" }, 
    { questionId: "q3", choiceId: "a" }, 
  ];

  const result = calculateQuizScore(
    privateQuiz,
    answersBelowThreshold
  );

  expect(result).toEqual({
    correctCount: 1,
    totalQuestions: 3,
    scorePercent: 33.33,
    passed: false,
  });
});

test("consider the skipped question false", () => {
  const incompleteAnswers = [
    { questionId: "q1", choiceId: "b" },
    { questionId: "q2", choiceId: "a" }, 
  ];

  const result = calculateQuizScore(privateQuiz, incompleteAnswers);

  expect(result).toEqual({
    correctCount: 2,
    totalQuestions: 3,
    scorePercent: 66.67,
    passed: true,
  });
});