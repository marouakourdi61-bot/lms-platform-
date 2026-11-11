
const NotificationConfig = require("../models/NotificationConfig");

const getNotificationConfig = async () => {
    let config = await NotificationConfig.findOne({ key: "global" }).lean();

    if (!config) {
        config = await NotificationConfig.create({ key: "global" });
        config = config.toObject();
    }

    return config;
};

module.exports = { getNotificationConfig };
