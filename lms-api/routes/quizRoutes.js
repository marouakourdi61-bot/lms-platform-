/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create a module quiz
 *     description: >-
 *       Course-owner trainer only; admins and learners are refused. One quiz per module;
 *       correctChoiceId is private trainer input.
 *     tags:
 *       - Quizzes
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
 *                   $ref: '#/components/schemas/PrivateQuiz'
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
 *       '409':
 *         description: Unique resource conflict.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 409
 *               message: Resource already exists
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
 *             $ref: '#/components/schemas/QuizCreate'
 *           example:
 *             moduleId: 507f1f77bcf86cd799439011
 *             title: JavaScript basics
 *             passingScore: 60
 *             isRequired: true
 *             questions:
 *               - id: q1
 *                 text: Which keyword declares a constant?
 *                 choices:
 *                   - id: a
 *                     text: const
 *                   - id: b
 *                     text: let
 *                 correctChoiceId: a
 * /api/quizzes/{quizId}:
 *   get:
 *     summary: Read a quiz without answer keys
 *     description: >-
 *       Learner only. Requires active enrollment, published course/module, active quiz and completion
 *       of the previous published module at order minus one. Completed/cancelled enrollments are
 *       refused. Only public question fields are returned.
 *     tags:
 *       - Quizzes
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
 *                   $ref: '#/components/schemas/PublicQuiz'
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
 *         name: quizId
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 *         description: MongoDB ObjectId.
 *   patch:
 *     summary: Update a module quiz
 *     description: >-
 *       Course-owner trainer only. At least one allowed field; moduleId cannot change. Private correct
 *       answers appear only in this trainer response.
 *     tags:
 *       - Quizzes
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
 *                   $ref: '#/components/schemas/PrivateQuiz'
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
 *         name: quizId
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 *         description: MongoDB ObjectId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizUpdate'
 *           example:
 *             passingScore: 70
 *             isActive: true
 */
const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate.js");
const { authorize } = require("../middlewares/authorize.js");
const {
  createQuizSchema,
  updateQuizSchema,
} = require("../validators/quizValidator.js");
const { roles } = require("../consts/roles.js");
const validate = require("../middlewares/validate.js");

const {
  createQuiz,
  updateQuiz,
  getQuiz,
} = require("../controllers/quizController");

router.get("/:quizId", authenticate, authorize(roles.LEARNER), getQuiz);

router.post(
  "/",
  authenticate,
  authorize(roles.TRAINER),
  validate(createQuizSchema),
  createQuiz,
);

router.patch(
  "/:quizId",
  authenticate,
  authorize(roles.TRAINER),
  validate(updateQuizSchema),
  updateQuiz,
);

module.exports = router;
