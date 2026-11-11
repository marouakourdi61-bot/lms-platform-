const JobExecution = require("../models/JobExecution");

const startJobExecution = async (jobName) => {
    return JobExecution.create({
        jobName,
        status: "running",
        startedAt: new Date(),
    });
};

const completeJobExecution = async (executionId, result = null) => {
    return JobExecution.findByIdAndUpdate(
        executionId,
        {
            $set: {
                status: "success",
                result,
                finishedAt: new Date(),
                errorMessage: null,
            },
        },
        { new: true, runValidators: true }
    );
};

const failJobExecution = async (executionId, error) => {
    return JobExecution.findByIdAndUpdate(
        executionId,
        {
            $set: {
                status: "failed",
                finishedAt: new Date(),
                errorMessage: error?.message || String(error),
            },
        },
        { new: true, runValidators: true }
    );
};

module.exports = {
    startJobExecution,
    completeJobExecution,
    failJobExecution,
};