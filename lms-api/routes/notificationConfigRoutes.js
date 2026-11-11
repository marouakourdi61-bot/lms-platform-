/**
 * @swagger
 * /api/config/notifications:
 *   post:
 *     summary: Create global notification configuration
 *     description: >-
 *       Admin only. Singleton key is global. Current responses use config rather than a
 *       status/message/data envelope. Automatic email/job services may create defaults when
 *       configuration is absent. PATCH refreshes job schedules. DELETE removes the record but does not
 *       itself stop already registered cron tasks.
 *     tags:
 *       - Configuration
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
 *                 config:
 *                   $ref: '#/components/schemas/NotificationConfig'
 *               required:
 *                 - config
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
 *       '409':
 *         description: Global configuration already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageError'
 *             example:
 *               message: Notification configuration already exists
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
 *             $ref: '#/components/schemas/ConfigCreate'
 *           example:
 *             notifications:
 *               enabled: true
 *               emailDriver: log
 *             jobs:
 *               trainerSummary:
 *                 enabled: false
 *                 frequency: 0 10 * * 1
 *   get:
 *     summary: Read global notification configuration
 *     description: >-
 *       Admin only. Singleton key is global. Current responses use config rather than a
 *       status/message/data envelope. Automatic email/job services may create defaults when
 *       configuration is absent. PATCH refreshes job schedules. DELETE removes the record but does not
 *       itself stop already registered cron tasks.
 *     tags:
 *       - Configuration
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
 *                 config:
 *                   $ref: '#/components/schemas/NotificationConfig'
 *               required:
 *                 - config
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
 *         description: Global configuration has not been created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageError'
 *             example:
 *               message: Notification configuration not found
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
 *     summary: Update global notification configuration
 *     description: >-
 *       Admin only. Singleton key is global. Current responses use config rather than a
 *       status/message/data envelope. Automatic email/job services may create defaults when
 *       configuration is absent. PATCH refreshes job schedules. DELETE removes the record but does not
 *       itself stop already registered cron tasks.
 *     tags:
 *       - Configuration
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
 *                 config:
 *                   $ref: '#/components/schemas/NotificationConfig'
 *               required:
 *                 - config
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
 *         description: Global configuration has not been created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageError'
 *             example:
 *               message: Notification configuration not found
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
 *             $ref: '#/components/schemas/ConfigUpdate'
 *           example:
 *             notifications:
 *               emailDriver: log
 *   delete:
 *     summary: Delete global notification configuration
 *     description: >-
 *       Admin only. Singleton key is global. Current responses use config rather than a
 *       status/message/data envelope. Automatic email/job services may create defaults when
 *       configuration is absent. PATCH refreshes job schedules. DELETE removes the record but does not
 *       itself stop already registered cron tasks.
 *     tags:
 *       - Configuration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '204':
 *         description: Deleted successfully. No response body.
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
 *         description: Global configuration has not been created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageError'
 *             example:
 *               message: Notification configuration not found
 *       '500':
 *         description: Unexpected server error; internal details are not exposed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 500
 *               message: Internal server error
 * /api/config/job-executions:
 *   get:
 *     summary: List job execution records
 *     description: >-
 *       Admin only. Returns all job execution records, newest startedAt first. limit is parsed as an
 *       integer, defaults to 20 and is clamped to 1..100.
 *     tags:
 *       - Configuration
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
 *                 count:
 *                   type: integer
 *                 executions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobExecution'
 *               required:
 *                 - count
 *                 - executions
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
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of executions; out-of-range values are clamped.
 */

const express = require("express");

const authenticate = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");
const { roles } = require("../consts/roles");
const validate = require("../middlewares/validate");

const {
    createNotificationConfig,
    getNotificationConfig,
    updateNotificationConfig,
    deleteNotificationConfig,
    listJobExecutions,
} = require("../controllers/notificationConfigController");

const {
    createNotificationConfigSchema,
    updateNotificationConfigSchema,
} = require("../validators/notificationConfigValidator");

const router = express.Router();

router.use(authenticate, authorize(roles.ADMIN));

router.post(
    "/notifications",
    validate(createNotificationConfigSchema),
    createNotificationConfig
);

router.get("/notifications", getNotificationConfig);

router.patch(
    "/notifications",
    validate(updateNotificationConfigSchema),
    updateNotificationConfig
);

router.delete("/notifications", deleteNotificationConfig);

router.get("/job-executions", listJobExecutions);

module.exports = router;
