
const { z } = require("zod");
const cronValidator = require("cron-validator");

const frequencySchema = z
    .string()
    .trim()
    .min(1, "Frequency is required")
    .refine(
        (frequency) => cronValidator.isValidCron(frequency),
        "Invalid cron frequency"
    );

const jobSettingsSchema = z
    .object({
        enabled: z.boolean(),
        frequency: frequencySchema,
    })
    .strict();

const patchJobSettingsSchema = z
    .object({
        enabled: z.boolean().optional(),
        frequency: frequencySchema.optional(),
    })
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        "At least one job setting must be provided"
    );

const updateNotificationConfigSchema = z
    .object({
        notifications: z
            .object({
                enabled: z.boolean().optional(),
                emailDriver: z.enum(["log", "sandbox", "smtp"]).optional(),
            })
            .strict()
            .optional(),

        jobs: z
            .object({
                inactiveLearnerReminder: patchJobSettingsSchema
                    .extend({
                        inactiveDays: z.number().int().min(1).max(365).optional(),
                    })
                    .strict()
                    .optional(),

                trainerSummary: patchJobSettingsSchema.optional(),
                statsRefresh: patchJobSettingsSchema.optional(),
            })
            .strict()
            .optional(),
    })
    .strict()
    .refine(
        (data) =>
            data.notifications !== undefined ||
            data.jobs !== undefined,
        {
            message: "At least one setting must be provided",
        }
    );

const createNotificationConfigSchema = z
    .object({
        notifications: z
            .object({
                enabled: z.boolean().optional(),
                emailDriver: z.enum(["log", "sandbox", "smtp"]).optional(),
            })
            .strict()
            .optional(),

        jobs: z
            .object({
                inactiveLearnerReminder: jobSettingsSchema
                    .extend({
                        inactiveDays: z.number().int().min(1).max(365).optional(),
                    })
                    .strict()
                    .optional(),

                trainerSummary: jobSettingsSchema.optional(),
                statsRefresh: jobSettingsSchema.optional(),
            })
            .strict()
            .optional(),
    })
    .strict()

module.exports = {
    updateNotificationConfigSchema,
    createNotificationConfigSchema,
};
