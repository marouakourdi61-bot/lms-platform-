
require("dotenv").config();
const mongoose = require("mongoose");
const jobHandlers = require("../services/jobHandlers");
const { runJob } = require("../services/jobScheduler");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await runJob(
      "inactiveLearnerReminder",
      jobHandlers.inactiveLearnerReminder
    );
  } catch (error) {
    console.error("[JOB SCRIPT ERROR]", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();

