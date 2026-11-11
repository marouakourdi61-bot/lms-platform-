
const express = require("express");
const router = express.Router();

const {
    enrollInCourse,
    getMyEnrollments
} = require("../controllers/enrollmentController");

const {
    getCourseProgress
} = require("../controllers/courseProgressController");

const authenticate = require("../middlewares/authenticate");

/**
 * @swagger
 * /api/courses/{courseId}/enroll:
 *   post:
 *     summary: Enroll in a published course
 *     description: >-
 *       Any authenticated account can enroll; no learner role restriction is applied. No request body
 *       is required.
 *     tags:
 *       - Enrollments
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
 *       '201':
 *         description: Returns message and the new enrollment in enrollment.
 *       '400':
 *         description: Invalid course ID or course is not published.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '404':
 *         description: Course not found.
 *       '409':
 *         description: An active enrollment already exists, or the learner/course pair violates the unique index.
 *       '500':
 *         description: Internal server error.
 */
router.post(
    "/courses/:courseId/enroll",
    authenticate,
    enrollInCourse
);

/**
 * @swagger
 * /api/enrollments/me:
 *   get:
 *     summary: List my enrollments
 *     description: Returns all enrollments for the authenticated account with populated course documents.
 *     tags:
 *       - Enrollments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: An array of enrollment documents, including their course.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '500':
 *         description: Internal server error.
 */
router.get(
    "/enrollments/me",
    authenticate,
    getMyEnrollments
);

/**
 * @swagger
 * /api/courses/{courseId}/progress:
 *   get:
 *     summary: Calculate course progress
 *     description: >-
 *       Counts completed published modules and consulted resources equally. Saves the percentage to
 *       enrollment and marks it completed at 100 percent. Accepts active or completed enrollments.
 *       Missing active or completed enrollment returns 404.
 *     tags:
 *       - Progress
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
 *         description: >-
 *           Returns message and data with courseId, learnerId, totalModules, completedModules,
 *           totalResources, consultedResources, percentage and enrollmentStatus.
 *       '400':
 *         description: Invalid course ID.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '404':
 *         description: Active or completed enrollment not found.
 *       '500':
 *         description: Internal server error.
 */
router.get(
    "/courses/:courseId/progress",
    authenticate,
    getCourseProgress
);

module.exports = router;
