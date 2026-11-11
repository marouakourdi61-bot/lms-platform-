const { z } = require("zod");

const choiceSchema = z
  .object({
    id: z.string().trim().min(1, "Choice ID is required"),
    text: z.string().trim().min(1, "Choice text is required"),
  })
  .strict();

const questionSchema = z
  .object({
    id: z.string().trim().min(1, "Question ID is required"),
    text: z.string().trim().min(1, "Question text is required"),
    choices: z
      .array(choiceSchema)
      .min(2, "A question must have at least two choices"),
    correctChoiceId: z.string().trim().min(1, "Correct choice ID is required"),
  })
  .strict()
  .refine(
    (question) =>
      new Set(question.choices.map((choice) => choice.id)).size ===
      question.choices.length,
    {
      message: "Choice IDs must be unique within a question",
      path: ["choices"],
    },
  )
  .refine(
    (question) =>
      question.choices.some((choice) => choice.id === question.correctChoiceId),
    {
      message: "Correct choice ID must match one of the question choices",
      path: ["correctChoiceId"],
    },
  );

const createQuizSchema = z
  .object({
    moduleId: z
      .string()
      .trim()
      .regex(/^[a-fA-F0-9]{24}$/, "Module ID must be a valid MongoDB ObjectId"),
    title: z.string().trim().min(1, "Title is required"),
    isActive: z.boolean().optional(),
    isRequired: z.boolean().optional(),
    passingScore: z
      .number()
      .min(0, "Passing score must be at least 0")
      .max(100, "Passing score must be at most 100"),
    questions: z
      .array(questionSchema)
      .min(1, "A quiz must have at least one question"),
  })
  .strict()
  .refine(
    (quiz) =>
      new Set(quiz.questions.map((question) => question.id)).size ===
      quiz.questions.length,
    {
      message: "Question IDs must be unique within a quiz",
      path: ["questions"],
    }
  );

const updateQuizSchema = z
  .object({
    title: createQuizSchema.shape.title.optional(),
    passingScore: createQuizSchema.shape.passingScore.optional(),
    questions: createQuizSchema.shape.questions.optional(),
    isActive: createQuizSchema.shape.isActive,
    isRequired: createQuizSchema.shape.isRequired,
  })
  .strict()
  .refine((quiz) => Object.values(quiz).some((value) => value !== undefined), {
    message: "At least one quiz field must be provided",
  })
  .refine(
    (quiz) =>
      quiz.questions === undefined ||
      new Set(quiz.questions.map((question) => question.id)).size ===
        quiz.questions.length,
    {
      message: "Question IDs must be unique within a quiz",
      path: ["questions"],
    },
  );

module.exports = {
  choiceSchema,
  questionSchema,
  createQuizSchema,
  updateQuizSchema,
};
