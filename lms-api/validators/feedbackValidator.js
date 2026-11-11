const { z } = require("zod");

const createFeedbackSchema = z
  .object({
    learner: z
      .string()
      .trim()
      .regex(
        /^[a-fA-F0-9]{24}$/,
        "Learner ID must be a valid MongoDB ObjectId",
      ),
    course: z
      .string()
      .trim()
      .regex(/^[a-fA-F0-9]{24}$/, "Course ID must be a valid MongoDB ObjectId"),
    module: z
      .string()
      .trim()
      .regex(/^[a-fA-F0-9]{24}$/, "Module ID must be a valid MongoDB ObjectId"),
    comment: z.string().trim().min(1, "Comment is required"),
  })
  .strict();

const updateFeedbackSchema = createFeedbackSchema.pick({ comment: true });

module.exports = {
  createFeedbackSchema,
  updateFeedbackSchema,
};
