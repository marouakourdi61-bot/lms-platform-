
require("dotenv").config();
const mongoose = require("mongoose");
const jobHandlers = require("../services/jobHandlers");
const { runJob } = require("../services/jobScheduler");

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const result = await runJob("statsRefresh", jobHandlers.statsRefresh);
        console.log("[JOB RESULT]", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("[JOB SCRIPT ERROR]", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

run();
