const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");

const {
    completeModule
} = require("../controllers/moduleProgressController");

/**
 * @swagger
 * /api/modules/{moduleId}/complete:
 *   post:
 *     summary: Complete a module
 *     description: >-
 *       Requires active enrollment, all module resources consulted, and completion of the published
 *       module at order minus one if it exists. If an active mandatory quiz exists, the learner must
 *       also have a passed attempt for that quiz. Optional quizzes do not block completion.
 *       Upserts completion progress. No request body required.
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId.
 *     responses:
 *       '200':
 *         description: Returns message and module progress in data.
 *       '400':
 *         description: Invalid ID, resources remain unconsulted, or the active mandatory quiz has not been passed.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '403':
 *         description: No active enrollment or previous module is incomplete.
 *       '404':
 *         description: Module not found.
 *       '500':
 *         description: Internal server error.
 */
router.post(
    "/:moduleId/complete",
    authenticate,
    completeModule
);

module.exports = router;
