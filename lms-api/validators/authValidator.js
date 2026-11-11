const { z } = require("zod");

const registerSchema = z
    .object({
        name: z
            .string({ error: "Name is required" })
            .trim()
            .min(2, "Name must contain at least 2 characters"),
        email: z
            .string({ error: "Email is required" })
            .trim()
            .toLowerCase()
            .email("Invalid email address"),
        password: z
            .string({ error: "Password is required" })
            .min(8, "Password must contain at least 8 characters")
    })
    .strict();

const loginSchema = z
    .object({
        email: z
            .string({ error: "Email is required" })
            .trim()
            .toLowerCase()
            .email("Invalid email address"),
        password: z
            .string({ error: "Password is required" })
            .min(1, "Password is required")
    })
    .strict();

module.exports = {
    registerSchema,
    loginSchema
};
