
const TrainerSummaryPreference = require("../models/TrainerSummaryPreference");

const getPreferences = async (trainerId) => {
    let preferences = await TrainerSummaryPreference.findOne({
        trainer: trainerId,
    });

    if (!preferences) {
        preferences = await TrainerSummaryPreference.create({
            trainer: trainerId,
        });
    }

    return preferences;
};

const updatePreferences = async (trainerId, updates) => {
    const allowedFields = [
        "subscribedToSummary",
        "includeDraftCourses",
        "includeArchivedCourses",
        "includeEnrollmentStats",
        "includeProgressStats",
    ];

    const safeUpdates = {};

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(updates, field)) {
            safeUpdates[field] = updates[field];
        }
    }

    return TrainerSummaryPreference.findOneAndUpdate(
        { trainer: trainerId },
        { $set: safeUpdates },
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
    );
};

module.exports = {
    getPreferences,
    updatePreferences,
};
