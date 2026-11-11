/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Create feedback for a learner
 *     description: >-
 *       Course-owner trainer only. Module must belong to the course and learner must have active or
 *       completed enrollment. Cancelled/no enrollment is refused. Trainer is taken from the token;
 *       admins cannot create via this route.
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '201':
 *         description: Successful response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   enum:
 *                     - 201
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Feedback'
 *               required:
 *                 - status
 *                 - message
 *                 - data
 *       '400':
 *         description: Invalid ID, JSON or request body. Validation errors may include an errors array.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 400
 *               message: Validation error
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
 *         description: Role or ownership/access rule refused the request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 403
 *               message: Forbidden
 *       '404':
 *         description: Requested record or linked record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 404
 *               message: Feedback not found
 *       '500':
 *         description: Unexpected server error; internal details are not exposed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 500
 *               message: Internal server error
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedbackCreate'
 *           example:
 *             learner: 507f1f77bcf86cd799439012
 *             course: 507f1f77bcf86cd799439013
 *             module: 507f1f77bcf86cd799439014
 *             comment: Good progress; review the final exercise.
 * /api/feedback/{feedbackId}:
 *   get:
 *     summary: Read feedback
 *     description: Recipient learner, current course-owner trainer, or admin. Other users are refused.
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   enum:
 *                     - 200
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Feedback'
 *               required:
 *                 - status
 *                 - message
 *                 - data
 *       '400':
 *         description: Invalid ID, JSON or request body. Validation errors may include an errors array.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 400
 *               message: Validation error
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
 *         description: Role or ownership/access rule refused the request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 403
 *               message: Forbidden
 *       '404':
 *         description: Requested record or linked record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 404
 *               message: Feedback not found
 *       '500':
 *         description: Unexpected server error; internal details are not exposed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 500
 *               message: Internal server error
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 *         description: MongoDB ObjectId.
 *   patch:
 *     summary: Update a feedback comment
 *     description: >-
 *       Current course-owner trainer or admin only. Updates the comment without changing trainer,
 *       learner, course or module associations. Extra fields are rejected.
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   enum:
 *                     - 200
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Feedback'
 *               required:
 *                 - status
 *                 - message
 *                 - data
 *       '400':
 *         description: Invalid ID, JSON or request body. Validation errors may include an errors array.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 400
 *               message: Validation error
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
 *         description: Role or ownership/access rule refused the request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 403
 *               message: Forbidden
 *       '404':
 *         description: Requested record or linked record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 404
 *               message: Feedback not found
 *       '500':
 *         description: Unexpected server error; internal details are not exposed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 500
 *               message: Internal server error
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 *         description: MongoDB ObjectId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedbackUpdate'
 *           example:
 *             comment: Updated feedback after reviewing your work.
 */
const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getFeedback,
  updateFeedback,
} = require("../controllers/feedbackController");
const authenticate = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {
  createFeedbackSchema,
  updateFeedbackSchema,
} = require("../validators/feedbackValidator");
const { roles } = require("../consts/roles");

router.post(
  "/",
  authenticate,
  authorize(roles.TRAINER),
  validate(createFeedbackSchema),
  createFeedback,
);

router.get(
  "/:feedbackId",
  authenticate,
  authorize(roles.TRAINER, roles.LEARNER, roles.ADMIN),
  getFeedback,
);

router.patch(
  "/:feedbackId",
  authenticate,
  authorize(roles.TRAINER, roles.ADMIN),
  validate(updateFeedbackSchema),
  updateFeedback,
);

module.exports = router;
