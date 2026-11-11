const express = require("express");

const authenticate = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");
const { roles } = require("../consts/roles");
const { getTrainerStats } = require("../controllers/trainerStatsController")


const {
    getMyCourses,
    getCourseLearners,
    getLearnerProgress
} = require("../controllers/trainerProgressController");

const router = express.Router();

/**
 * @swagger
 * /api/trainer/courses:
 *   get:
 *     summary: List my trainer courses
 *     description: Lists only courses owned by the authenticated trainer, newest first.
 *     tags:
 *       - Trainer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Returns message and an array of course documents in data.
 *       '400':
 *         description: Unsupported status filter.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '403':
 *         description: Trainer role required.
 *       '500':
 *         description: Internal server error.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - draft
 *             - published
 *             - archived
 */
router.get("/courses",
    authenticate,
    authorize(roles.TRAINER),
    getMyCourses
);

/**
 * @swagger
 * /api/trainer/courses/{courseId}/learners:
 *   get:
 *     summary: List course learners
 *     description: >-
 *       Requires course ownership. Includes active and completed enrollments with learner name and
 *       email populated. Missing or unowned courses return 404.
 *     tags:
 *       - Trainer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId.
 *     responses:
 *       '200':
 *         description: Returns message and enrollment documents in data.
 *       '400':
 *         description: Invalid course ID.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '403':
 *         description: Trainer role required.
 *       '404':
 *         description: Course not found or not owned by the trainer.
 *       '500':
 *         description: Internal server error.
 */
router.get(
    "/courses/:courseId/learners",
    authenticate,
    authorize(roles.TRAINER),
    getCourseLearners
);

/**
 * @swagger
 * /api/trainer/courses/{courseId}/learners/{learnerId}/progress:
 *   get:
 *     summary: View learner progress
 *     description: >-
 *       Requires course ownership and active or completed learner enrollment. Returns stored
 *       enrollment progress and current module/resource counts without recalculating the stored
 *       percentage. Missing course, ownership or enrollment returns 404.
 *     tags:
 *       - Trainer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId.
 *       - in: path
 *         name: learnerId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId.
 *     responses:
 *       '200':
 *         description: >-
 *           Returns message and data containing course (id, title), learner, enrollment (status,
 *           progress), modules (total, completed, data) and resources (total, consulted).
 *       '400':
 *         description: Invalid course or learner ID.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '403':
 *         description: Trainer role required.
 *       '404':
 *         description: Course not found, not owned by the trainer, or learner not enrolled.
 *       '500':
 *         description: Internal server error.
 */
router.get(
    "/courses/:courseId/learners/:learnerId/progress",
    authenticate,
    authorize(roles.TRAINER),
    getLearnerProgress
);

/**
 * @swagger
 * /api/trainer/stats:
 *   get:
 *     summary: Read my cached course statistics
 *     description: >-
 *       Trainer only; admins and learners receive 403. Reads the latest successful global
 *       statsRefresh execution by finishedAt, without running a refresh. Check refreshedAt for
 *       staleness. Includes all current owned courses regardless of publication status; courses
 *       absent from the snapshot receive zero metrics. Enrollment metrics include every enrollment
 *       status. Attempt metrics include all attempts, not just one per learner. Progress and score
 *       averages are rounded to two decimals. Without a successful snapshot, returns HTTP 200
 *       with dataAvailable false, refreshedAt null and an empty courses array.
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Cached statistics or no-snapshot response. No top-level status field.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrainerStatsResponse'
 *             examples:
 *               available:
 *                 summary: Successful snapshot with one owned course
 *                 value:
 *                   message: trainer statistics retrieved successfully
 *                   data:
 *                     dataAvailable: true
 *                     refreshedAt: '2026-10-28T09:00:00.000Z'
 *                     courses:
 *                       - courseId: '507f1f77bcf86cd799439011'
 *                         courseTitle: JavaScript basics
 *                         totalEnrollments: 3
 *                         averageProgress: 40
 *                         totalAttempts: 3
 *                         passedAttempts: 2
 *                         averageScore: 60
 *                         feedbackCount: 2
 *               unavailable:
 *                 summary: No successful statsRefresh execution yet
 *                 value:
 *                   message: trainer statistics retrieved successfully
 *                   data:
 *                     dataAvailable: false
 *                     refreshedAt: null
 *                     courses: []
 *       '401':
 *         description: Missing, malformed, invalid or expired Bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 401
 *               message: Authorization header missing
 *       '403':
 *         description: Trainer role required; admins are also refused.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 403
 *               message: Forbidden
 *       '500':
 *         description: Unexpected server or database error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 500
 *               message: Internal server error
 */
router.get(
    "/stats",
    authenticate,
    authorize(roles.TRAINER),
    getTrainerStats
);

module.exports = router;
