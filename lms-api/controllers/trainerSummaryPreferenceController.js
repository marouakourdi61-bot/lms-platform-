
const {
  getPreferences,
  updatePreferences,
} = require("../services/trainerSummaryPreferenceService");

const getTrainerSummaryPreferences = async (req, res, next) => {
  try {
    const preferences = await getPreferences(req.user.id);

    return res.status(200).json({
      message: "Préférences du résumé récupérées avec succès",
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

const updateTrainerSummaryPreferences = async (req, res, next) => {
  try {
    const preferences = await updatePreferences(req.user.id, req.body);

    return res.status(200).json({
      message: "Préférences du résumé mises à jour avec succès",
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrainerSummaryPreferences,
  updateTrainerSummaryPreferences,
};
