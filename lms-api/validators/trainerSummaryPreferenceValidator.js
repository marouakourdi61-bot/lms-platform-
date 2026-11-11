
const { z } = require("zod");

const updateTrainerSummaryPreferenceSchema = z.object({
    subscribedToSummary: z.boolean().optional(),
    includeDraftCourses: z.boolean().optional(),
    includeArchivedCourses: z.boolean().optional(),
    includeEnrollmentStats: z.boolean().optional(),
    includeProgressStats: z.boolean().optional(),
}).strict().refine(
    (data) => Object.keys(data).length > 0,
    { message: "Au moins une préférence doit être fournie" }
);

module.exports = {
    updateTrainerSummaryPreferenceSchema,
};
