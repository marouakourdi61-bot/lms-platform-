
const cron = require("node-cron");
const { getNotificationConfig } = require("./notificationConfigService");
const {
    startJobExecution,
    completeJobExecution,
    failJobExecution,
} = require("./jobExecutionService");

const registeredJobs = new Map();

const runJob = async (jobName, handler) => {
    const execution = await startJobExecution(jobName);

    console.log(`[JOB START] ${jobName} (${execution._id})`);

    try {
        const result = await handler();
        const completed = await completeJobExecution(
            execution._id,
            result ?? null
        );

        console.log(`[JOB SUCCESS] ${jobName} (${execution._id})`);

        return completed;
    } catch (error) {
        await failJobExecution(execution._id, error);
        console.error(`[JOB FAILED] ${jobName} (${execution._id}):`, error.message);
        throw error;
    }
};

const refreshJobSchedules = async (jobHandlers) => {
    const config = await getNotificationConfig();

    const jobNames = [
        "inactiveLearnerReminder",
        "trainerSummary",
        "statsRefresh",
    ];

    for (const jobName of jobNames) {
        const settings = config.jobs?.[jobName];
        const handler = jobHandlers[jobName];
        const existingTask = registeredJobs.get(jobName);

        if (existingTask) {
            existingTask.stop();
            registeredJobs.delete(jobName);
        }

        if (!settings?.enabled || typeof handler !== "function") {
            continue;
        }

        if (!cron.validate(settings.frequency)) {
            console.error(`[JOB CONFIG] Invalid frequency for ${jobName}`);
            continue;
        }


        const task = cron.schedule(
            settings.frequency,
            () => {
                void runJob(jobName, handler).catch(() => {
                    //erreur deja enregistrée et journalisée par runJob
                });
            },
            {
                timezone: "Africa/Casablanca",
            }
        );


        registeredJobs.set(jobName, task);
        console.log(`[JOB REGISTERED] ${jobName}: ${settings.frequency}`);
    }
};

const stopJobSchedules = () => {
    for (const task of registeredJobs.values()) {
        task.stop();
    }

    registeredJobs.clear();
};

module.exports = {
    runJob,
    refreshJobSchedules,
    stopJobSchedules,
};
