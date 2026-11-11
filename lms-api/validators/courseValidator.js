const { z } = require("zod");

const createCourseSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1, "Description is required"),
    objectives: z.array(z.string().trim().min(1)).optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    category: z.string().trim().min(1, "Category is required"),
    estimatedDuration: z.number().min(1, "Estimated duration must be at least 1"),
  })
  .strict();

module.exports = { createCourseSchema };
