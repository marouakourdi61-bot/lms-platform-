/**
 * @swagger
 * /api/jobs/inactive-reminders/run:
 *   post:
 *     summary: Run inactiveLearnerReminder
 *     description: >-
 *       Admin only. Executes inactiveLearnerReminder synchronously and records its execution. No
 *       request body required. Manual execution does not depend on the cron enabled flag; individual
 *       handlers may return disabled/skipped results. Execution errors are recorded and returned
 *       through the error handler. Both /api/jobs and /api/admin/jobs are mounted aliases.
 *     tags:
 *       - Jobs
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
 *                 execution:
 *                   $ref: '#/components/schemas/JobExecution'
 *               required:
 *                 - message
 *                 - execution
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
 *         description: Unknown job name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 404
 *               message: Job not found
 *       '500':
 *         description: Unexpected server error; internal details are not exposed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 500
 *               message: Internal server error
 * /api/jobs/trainer-summary/run:
 *   post:
 *     summary: Run trainerSummary
 *     description: >-
 *       Admin only. Executes trainerSummary synchronously and records its execution. No request body
 *       required. Manual execution does not depend on the cron enabled flag; individual handlers may
 *       return disabled/skipped results. Execution errors are recorded and returned through the error
 *       handler. Both /api/jobs and /api/admin/jobs are mounted aliases.
 *     tags:
 *       - Jobs
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
 *                 execution:
 *                   $ref: '#/components/schemas/JobExecution'
 *               required:
 *                 - message
 *                 - execution
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
 *         description: Unknown job name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 404
 *               message: Job not found
 *       '500':
 *         description: Unexpected server error; internal details are not exposed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 500
 *               message: Internal server error
 * /api/jobs/stats/run:
 *   post:
 *     summary: Run statsRefresh
 *     description: >-
 *       Admin only. Executes statsRefresh synchronously and records its execution. No request body
 *       required. Manual execution does not depend on the cron enabled flag; individual handlers may
 *       return disabled/skipped results. Execution errors are recorded and returned through the error
 *       handler. Both /api/jobs and /api/admin/jobs are mounted aliases.
 *     tags:
 *       - Jobs
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
 *                 execution:
 *                   $ref: '#/components/schemas/JobExecution'
 *               required:
 *                 - message
 *                 - execution
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
 *         description: Unknown job name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 404
 *               message: Job not found
 *       '500':
 *         description: Unexpected server error; internal details are not exposed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 500
 *               message: Internal server error
 * /api/jobs/{jobName}/run:
 *   post:
 *     summary: Run a named job
 *     description: >-
 *       Admin only. Executes the named handler synchronously and records its execution. No request
 *       body required. Manual execution does not depend on the cron enabled flag; individual handlers
 *       may return disabled/skipped results. Execution errors are recorded and returned through the
 *       error handler. Both /api/jobs and /api/admin/jobs are mounted aliases.
 *     tags:
 *       - Jobs
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
 *                 execution:
 *                   $ref: '#/components/schemas/JobExecution'
 *               required:
 *                 - message
 *                 - execution
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
 *         description: Unknown job name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 404
 *               message: Job not found
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
 *         name: jobName
 *         required: true
 *         schema:
 *           type: string
 *         description: >-
 *           Supported: inactiveLearnerReminder, trainerSummary, statsRefresh. Unknown names return
 *           404.
 * /api/admin/jobs/inactive-reminders/run:
 *   post:
 *     summary: Run inactiveLearnerReminder
 *     description: >-
 *       Admin only. Executes inactiveLearnerReminder synchronously and records its execution. No
 *       request body required. Manual execution does not depend on the cron enabled flag; individual
 *       handlers may return disabled/skipped results. Execution errors are recorded and returned
 *       through the error handler. Both /api/jobs and /api/admin/jobs are mounted aliases.
 *     tags:
 *       - Jobs
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
 *                 execution:
 *                   $ref: '#/components/schemas/JobExecution'
 *               required:
 *                 - message
 *                 - execution
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
 *         description: Unknown job name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 404
 *               message: Job not found
 *       '500':
 *         description: Unexpected server error; internal details are not exposed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 500
 *               message: Internal server error
 * /api/admin/jobs/trainer-summary/run:
 *   post:
 *     summary: Run trainerSummary
 *     description: >-
 *       Admin only. Executes trainerSummary synchronously and records its execution. No request body
 *       required. Manual execution does not depend on the cron enabled flag; individual handlers may
 *       return disabled/skipped results. Execution errors are recorded and returned through the error
 *       handler. Both /api/jobs and /api/admin/jobs are mounted aliases.
 *     tags:
 *       - Jobs
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
 *                 execution:
 *                   $ref: '#/components/schemas/JobExecution'
 *               required:
 *                 - message
 *                 - execution
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
 *         description: Unknown job name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 404
 *               message: Job not found
 *       '500':
 *         description: Unexpected server error; internal details are not exposed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 500
 *               message: Internal server error
 * /api/admin/jobs/stats/run:
 *   post:
 *     summary: Run statsRefresh
 *     description: >-
 *       Admin only. Executes statsRefresh synchronously and records its execution. No request body
 *       required. Manual execution does not depend on the cron enabled flag; individual handlers may
 *       return disabled/skipped results. Execution errors are recorded and returned through the error
 *       handler. Both /api/jobs and /api/admin/jobs are mounted aliases.
 *     tags:
 *       - Jobs
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
 *                 execution:
 *                   $ref: '#/components/schemas/JobExecution'
 *               required:
 *                 - message
 *                 - execution
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
 *         description: Unknown job name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 404
 *               message: Job not found
 *       '500':
 *         description: Unexpected server error; internal details are not exposed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 500
 *               message: Internal server error
 * /api/admin/jobs/{jobName}/run:
 *   post:
 *     summary: Run a named job
 *     description: >-
 *       Admin only. Executes the named handler synchronously and records its execution. No request
 *       body required. Manual execution does not depend on the cron enabled flag; individual handlers
 *       may return disabled/skipped results. Execution errors are recorded and returned through the
 *       error handler. Both /api/jobs and /api/admin/jobs are mounted aliases.
 *     tags:
 *       - Jobs
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
 *                 execution:
 *                   $ref: '#/components/schemas/JobExecution'
 *               required:
 *                 - message
 *                 - execution
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
 *         description: Unknown job name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: 404
 *               message: Job not found
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
 *         name: jobName
 *         required: true
 *         schema:
 *           type: string
 *         description: >-
 *           Supported: inactiveLearnerReminder, trainerSummary, statsRefresh. Unknown names return
 *           404.
 */

const express = require("express");
const { runJobManually } = require("../controllers/jobController");
const authenticate = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");
const { roles } = require("../consts/roles");

const router = express.Router();

router.use(authenticate, authorize(roles.ADMIN));

router.post(
    "/inactive-reminders/run",
    (req, res, next) => {
        req.params.jobName = "inactiveLearnerReminder";
        runJobManually(req, res, next);
    }
);

router.post(
    "/trainer-summary/run",
    (req, res, next) => {
        req.params.jobName = "trainerSummary";
        runJobManually(req, res, next);
    }
);

router.post(
    "/stats/run",
    (req, res, next) => {
        req.params.jobName = "statsRefresh";
        runJobManually(req, res, next);
    }
);

router.post("/:jobName/run", runJobManually);

module.exports = router;
