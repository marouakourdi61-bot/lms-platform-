
require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");
const jobHandlers = require("./services/jobHandlers");

const {
    refreshJobSchedules,
    stopJobSchedules,
} = require("./services/jobScheduler");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        await refreshJobSchedules(jobHandlers);

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        const shutdown = () => {
            stopJobSchedules();

            server.close(() => {
                process.exit(0);
            });
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
    } catch (error) {
        console.error("Server startup failed:", error.message);
        stopJobSchedules();
        process.exit(1);
    }
};

startServer();
