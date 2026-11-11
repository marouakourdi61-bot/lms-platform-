const { getTrainerStats: fetchTrainerStats } = require("../services/trainerStatsService")

const getTrainerStats = async (req, res, next) => {
    try {
        const stats = await fetchTrainerStats(req.user.id)

        return res.status(200).json({
            message: "trainer statistics retrieved successfully",
            data: stats
        })
    } catch(error) {
        next(error)
    }
}

module.exports = { getTrainerStats };