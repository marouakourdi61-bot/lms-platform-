const NotificationConfig = require("../models/NotificationConfig");
const JobExecution = require("../models/JobExecution");

const {
    refreshJobSchedules,
} = require("../services/jobScheduler");

const getNotificationConfig = async (req, res, next) => {
    try {
        const config = await NotificationConfig.findOne({ key: "global" });

        if (!config) {
            return res.status(404).json({
                message: "Notification configuration not found",
            });
        }

        return res.status(200).json({ config });
    } catch (error) {
        next(error);
    }
};


const updateNotificationConfig = async (req, res, next) => {
    try {
        const updates = {};

        if (req.body.notifications) {
            for (const [key, value] of Object.entries(req.body.notifications)) {
                updates[`notifications.${key}`] = value;
            }
        }

        if (req.body.jobs) {
            for (const [jobName, settings] of Object.entries(req.body.jobs)) {
                for (const [key, value] of Object.entries(settings)) {
                    updates[`jobs.${jobName}.${key}`] = value;
                }
            }
        }

        const config = await NotificationConfig.findOneAndUpdate(
            { key: "global" },
            { $set: updates },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!config) {
            return res.status(404).json({
                message: "Notification configuration not found",
            });
        }

        await refreshJobSchedules(
            require("../services/jobHandlers")
        );

        return res.status(200).json({ config });
    } catch (error) {
        next(error);
    }
};

const listJobExecutions = async (req, res, next) => {
    try {
        const limit = Math.min(
            Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
            100
        );

        const executions = await JobExecution.find()
            .sort({ startedAt: -1 })
            .limit(limit)
            .lean();

        return res.status(200).json({
            count: executions.length,
            executions,
        });
    } catch (error) {
        next(error);
    }
};


const createNotificationConfig = async (req, res, next) => {
    try {
        const existingConfig = await NotificationConfig.findOne({
            key: "global",
        });

        if (existingConfig) {
            return res.status(409).json({
                message: "Notification configuration already exists",
            });
        }

        const config = await NotificationConfig.create({
            ...req.body,
            key: "global",
        });

        return res.status(201).json({ config });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Notification configuration already exists",
            });
        }

        next(error);
    }
};


const deleteNotificationConfig = async (req, res, next) => {
    try {
        const config = await NotificationConfig.findOneAndDelete({
            key: "global",
        });

        if (!config) {
            return res.status(404).json({
                message: "Notification configuration not found",
            });
        }

        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotificationConfig,
    updateNotificationConfig,
    listJobExecutions,
    createNotificationConfig,
    deleteNotificationConfig
};
