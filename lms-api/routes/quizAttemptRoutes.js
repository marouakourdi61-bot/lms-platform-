/**
 * @swagger
 * /api/quizzes/{quizId}/attempts:
 *   post:
 *     summary: Submit answers and calculate a score
 *     description: >-
 *       Learner only. Saves the authenticated learner ID and computes score/pass on the backend.
 *       Returns submitted choices, never the answer key. Current implementation checks quiz existence
 *       but does not apply the enrollment/publication/unlock checks used by GET /api/quizzes/{quizId}.
 *     tags:
 *       - Quiz attempts
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
 *                   $ref: '#/components/schemas/Attempt'
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
 *             $ref: '#/components/schemas/AttemptInput'
 *           example:
 *             answers:
 *               - questionId: q1
 *                 choiceId: a
 *   get:
 *     summary: Read quiz attempt history
 *     description: >-
 *       Learners receive only their own attempts; caller-supplied learner query parameters do not
 *       change ownership. Course-owner trainers receive all attempts for this quiz. Admins are
 *       refused. Results are newest first. No private quiz/answer key is returned. Enrollment is not
 *       checked by this route.
 *     tags:
 *       - Quiz attempts
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attempt'
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
 */
const express = require("express")
const router = express.Router()

const authenticate = require("../middlewares/authenticate")
const { authorize } = require("../middlewares/authorize")
const { roles } = require("../consts/roles")
const validate = require("../middlewares/validate")
const { submitQuizAttemptSchema } = require("../validators/quizAttemptValidator")
const { submitQuizAttempt, getQuizAttempts } = require("../controllers/quizAttemptController")

router.post(
    "/:quizId/attempts", 
    authenticate,
    authorize(roles.LEARNER),
    validate(submitQuizAttemptSchema),
    submitQuizAttempt
);

router.get(
    "/:quizId/attempts",
    authenticate,
    authorize(roles.LEARNER, roles.TRAINER),
    getQuizAttempts
);

module.exports = router;