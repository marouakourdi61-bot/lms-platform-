
const JobExecution = require("../models/JobExecution");
const {
    startJobExecution,
    completeJobExecution,
    failJobExecution,
} = require("../services/jobExecutionService");

describe("jobExecutionService", () => {
    afterEach(async () => {
        await JobExecution.deleteMany({
            jobName: {
                $in: [
                    "inactiveLearnerReminder",
                    "trainerSummary",
                    "statsRefresh",
                ],
            },
        });
    });

    it("creates an execution with running status", async () => {
        const execution = await startJobExecution("statsRefresh");

        expect(execution.status).toBe("running");
        expect(execution.jobName).toBe("statsRefresh");
        expect(execution.startedAt).toBeInstanceOf(Date);
        expect(execution.finishedAt).toBeNull();
    });

    it("records a successful execution and its result", async () => {
        const execution = await startJobExecution("statsRefresh");

        const completed = await completeJobExecution(execution._id, {
            processed: 10,
        });

        expect(completed.status).toBe("success");
        expect(completed.result.processed).toBe(10);
        expect(completed.finishedAt).toBeInstanceOf(Date);
        expect(completed.errorMessage).toBeNull();
    });

    it("records a failed execution and its error message", async () => {
        const execution = await startJobExecution("trainerSummary");

        const failed = await failJobExecution(
            execution._id,
            new Error("Test failure")
        );

        expect(failed.status).toBe("failed");
        expect(failed.errorMessage).toBe("Test failure");
        expect(failed.finishedAt).toBeInstanceOf(Date);
    });
});
