const privateQuiz = {
  id: "quiz-01",
  moduleId: "module-01",
  title: "JavaScript basics",
  isActive: true,
  isRequired: true,
  passingScore: 60,
  questions: [
    {
      id: "q1",
      text: "Boolean question",
      choices: [
        { id: "a", text: "False" },
        { id: "b", text: "True" },
      ],
      correctChoiceId: "b",
    },
    {
      id: "q2",
      text: "Question 2",
      choices: [
        { id: "a", text: "Jawab s7i7" },
        { id: "b", text: "Jawab ghalet" },
      ],
      correctChoiceId: "a",
    },
    {
      id: "q3",
      text: "Question 3",
      choices: [
        { id: "a", text: "Jawab ghalet" },
        { id: "b", text: "Jawab s7i7" },
      ],
      correctChoiceId: "b",
    },
  ],
};

const submission = {
  quizId: "quiz-01",
  answers: [
    { questionId: "q1", choiceId: "b" },
    { questionId: "q2", choiceId: "a" },
    { questionId: "q3", choiceId: "a" },
  ],
};

module.exports = { privateQuiz, submission };