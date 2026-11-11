
const { z } = require("zod");

const createModuleSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),

    description: z
      .string()
      .trim()
      .min(1, "Description is required"),

    order: z
      .number()
      .int("Order must be an integer")
      .min(1, "Order must be at least 1"),

    estimatedDuration: z
      .number()
      .min(1, "Estimated duration must be at least 1"),

    status: z
      .enum(["draft", "published"])
      .optional(),
  })
  .strict();

module.exports = { createModuleSchema };
