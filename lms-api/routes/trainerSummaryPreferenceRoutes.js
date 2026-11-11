/**
 * @swagger
 * /api/trainer/summary-preferences:
 *   get:
 *     summary: Read my trainer summary preferences
 *     description: >-
 *       Trainer only, scoped to the token identity. Creates default preferences if none exist. No
 *       trainer ID or extra fields are accepted in the PATCH body. GET also has this creation side
 *       effect.
 *     tags:
 *       - Trainer preferences
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Preference'
 *               required:
 *                 - message
 *                 - data
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
 *       '500':
 *         description: Unexpected server error; internal details are not exposed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 500
 *               message: Internal server error
 *   patch:
 *     summary: Update my trainer summary preferences
 *     description: >-
 *       Trainer only, scoped to the token identity. Creates default preferences if none exist. No
 *       trainer ID or extra fields are accepted in the PATCH body. GET also has this creation side
 *       effect.
 *     tags:
 *       - Trainer preferences
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Preference'
 *               required:
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
 *             $ref: '#/components/schemas/PreferenceUpdate'
 *           example:
 *             includeDraftCourses: true
 *             includeProgressStats: true
 */
const express = require("express");
const authenticate = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");
const { roles } = require("../consts/roles");
const validate = require("../middlewares/validate");


const {
    getTrainerSummaryPreferences,
    updateTrainerSummaryPreferences,
}= require("../controllers/trainerSummaryPreferenceController");

const {
    
    updateTrainerSummaryPreferenceSchema,
}= require("../validators/trainerSummaryPreferenceValidator");

const router = express.Router();

router.use(authenticate, authorize(roles.TRAINER));

router.get("/", getTrainerSummaryPreferences);

router.patch(
  "/",
  validate(updateTrainerSummaryPreferenceSchema),
  updateTrainerSummaryPreferences
);

module.exports = router;

