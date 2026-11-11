const jobHandlers = require("../services/jobHandlers");
const { runJob } = require("../services/jobScheduler");

const runJobManually = async (req, res, next) => {
    try {
        const { jobName } = req.params;
        const handler = jobHandlers[jobName];

        if (typeof handler !== "function") {
            return res.status(404).json({
                status: 404,
                message: "Job not found",
            });
        }

        const execution = await runJob(jobName, handler);

        return res.status(200).json({
            message: "Job executed successfully",
            execution,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { runJobManually };
