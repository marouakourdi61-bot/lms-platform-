const express = require("express");
const { roles } = require("../consts/roles");
const { authorize } = require("../middlewares/authorize");
const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");
const { createCourseSchema } = require("../validators/courseValidator");
const { createModuleSchema } = require("../validators/moduleValidator");
const { resumeCourse } = require("../controllers/courseResumeController");

const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  changeCourseStatus,
} = require("../controllers/courseController");

const { getModulesByCourse, createModule,updateModule, deleteModule, changeModuleStatus } = require("../controllers/moduleController");

const checkEnrollment = require("../middlewares/checkEnrollment");


const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Liste des cours publiés
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *         example: Backend
 *
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filtrer par niveau
 *         example: beginner
 *
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Rechercher par titre ou description
 *         example: JavaScript
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, publishedAt]
 *         description: Trier les cours
 *         example: publishedAt
 *
 *     responses:
 *       200:
 *         description: Liste des cours récupérée avec succès
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/", getCourses);

/**
 * @swagger
 * /api/courses/{id}/modules:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     description: Requires active enrollment; returns published modules ordered by order.
 *     summary: Liste des modules d'un cours
 *     tags:
 *       - Modules
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du cours
 *         example: 68da12345678901234567890
 *
 *     responses:
 *       200:
 *         description: Liste des modules récupérée avec succès
 *       400:
 *         description: ID du cours invalide
 *       401:
 *         description: Missing, invalid, or expired token.
 *       403:
 *         description: Active enrollment required.
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/:id/modules", authenticate, checkEnrollment, getModulesByCourse);


/**
 * @swagger
 * /api/courses/{id}/modules:
 *   post:
 *     summary: Create a module
 *     description: >-
 *       Trainer role required. Checks duplicate title and order within the course. Currently does not
 *       check course existence or ownership.
 *     tags:
 *       - Modules
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId.
 *     responses:
 *       '201':
 *         description: Returns message and the created module in data.
 *       '400':
 *         description: Invalid ID or module body.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '403':
 *         description: Trainer role required.
 *       '409':
 *         description: Title or order already exists.
 *       '500':
 *         description: Internal server error.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required:
 *               - title
 *               - description
 *               - order
 *               - estimatedDuration
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *               description:
 *                 type: string
 *                 minLength: 1
 *               order:
 *                 type: integer
 *                 minimum: 1
 *               estimatedDuration:
 *                 type: number
 *                 minimum: 1
 *               status:
 *                 type: string
 *                 enum:
 *                   - draft
 *                   - published
 *           example:
 *             title: Introduction
 *             description: First lesson
 *             order: 1
 *             estimatedDuration: 10
 *             status: draft
 */
router.post(
    "/:courseId/modules",
    authenticate,
    authorize(roles.TRAINER),
    validate(createModuleSchema),
    createModule
);

/**
 * @swagger
 * /api/courses/modules/{moduleId}:
 *   put:
 *     summary: Update a module
 *     description: Trainer role required; course ownership is not checked. Supply all required module fields.
 *     tags:
 *       - Modules
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
 *         description: Returns message and updated module in data.
 *       '400':
 *         description: Invalid ID or module body.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '403':
 *         description: Trainer role required.
 *       '404':
 *         description: Module not found.
 *       '500':
 *         description: Internal server error.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required:
 *               - title
 *               - description
 *               - order
 *               - estimatedDuration
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *               description:
 *                 type: string
 *                 minLength: 1
 *               order:
 *                 type: integer
 *                 minimum: 1
 *               estimatedDuration:
 *                 type: number
 *                 minimum: 1
 *               status:
 *                 type: string
 *                 enum:
 *                   - draft
 *                   - published
 *           example:
 *             title: Introduction
 *             description: First lesson
 *             order: 1
 *             estimatedDuration: 10
 *             status: draft
 */
router.put(
    "/modules/:moduleId",
    authenticate,
    authorize(roles.TRAINER),
    validate(createModuleSchema),
    updateModule
);

/**
 * @swagger
 * /api/courses/modules/{moduleId}:
 *   delete:
 *     summary: Delete a module
 *     description: >-
 *       Trainer role required; course ownership is not checked. Deletes only the module document,
 *       without checking or removing related resources or progress.
 *     tags:
 *       - Modules
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
 *         description: Returns a confirmation message.
 *       '400':
 *         description: Invalid module ID.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '403':
 *         description: Trainer role required.
 *       '404':
 *         description: Module not found.
 *       '500':
 *         description: Internal server error.
 */
router.delete(
    "/modules/:moduleId",
    authenticate,
    authorize(roles.TRAINER),
    deleteModule
);



/**
 * @swagger
 * /api/courses/modules/{moduleId}/status/{status}:
 *   patch:
 *     summary: Change module publication status
 *     description: >-
 *       Requires the trainer who owns the course. The current route also validates a full module body,
 *       although the controller only changes status from the URL.
 *     tags:
 *       - Modules
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - draft
 *             - published
 *     responses:
 *       '200':
 *         description: >-
 *           Returns status, message and module in data, including when already at the requested
 *           status.
 *       '400':
 *         description: Invalid ID, body, or target status.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '403':
 *         description: Trainer role or course ownership required.
 *       '404':
 *         description: Module or course not found.
 *       '500':
 *         description: Internal server error.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required:
 *               - title
 *               - description
 *               - order
 *               - estimatedDuration
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *               description:
 *                 type: string
 *                 minLength: 1
 *               order:
 *                 type: integer
 *                 minimum: 1
 *               estimatedDuration:
 *                 type: number
 *                 minimum: 1
 *               status:
 *                 type: string
 *                 enum:
 *                   - draft
 *                   - published
 *           example:
 *             title: Introduction
 *             description: First lesson
 *             order: 1
 *             estimatedDuration: 10
 *             status: draft
 */
router.patch(
    "/modules/:moduleId/status/:status",
    authenticate,
    authorize(roles.TRAINER),
    validate(createModuleSchema),
    changeModuleStatus
);



/**
 * @swagger
 * /api/courses/{courseId}/resume:
 *   get:
 *     summary: Resume a course
 *     description: >-
 *       Uses active or completed enrollment. Returns the first unfinished published module, the next
 *       module, courseCompleted and progress. Modules can be null. Recalculates and saves enrollment
 *       progress. Missing active or completed enrollment returns 403.
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
 *           Returns message and data containing courseId, currentModule, nextModule, courseCompleted
 *           and progress.
 *       '400':
 *         description: Invalid course ID.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '403':
 *         description: Active or completed enrollment required.
 *       '500':
 *         description: Internal server error.
 */
router.get("/:courseId/resume", authenticate, resumeCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Obtenir le détail d'un cours
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du cours
 *         example: 68da12345678901234567890
 *
 *     responses:
 *       200:
 *         description: Détail du cours récupéré avec succès
 *       400:
 *         description: ID du cours invalide
 *       404:
 *         description: Cours introuvable
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/:id", getCourseById);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a draft course
 *     description: Only trainers can create courses. The owner comes from the authenticated user; trainer, status, and other extra fields are rejected in the request body.
 *     tags:
 *       - Courses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [title, description, level, category, estimatedDuration]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 description: Trimmed; must not be blank.
 *                 example: JavaScript Basics
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 description: Trimmed; must not be blank.
 *                 example: Learn JavaScript fundamentals
 *               objectives:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 1
 *                   description: Trimmed; must not be blank.
 *                 example: [Understand variables, Write functions]
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               category:
 *                 type: string
 *                 minLength: 1
 *                 description: Trimmed; must not be blank.
 *                 example: Development
 *               estimatedDuration:
 *                 type: number
 *                 minimum: 1
 *                 example: 60
 *     responses:
 *       201:
 *         description: Draft course created and assigned to the authenticated trainer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Course created successfully
 *                 data:
 *                   type: object
 *                   description: Created course document, including the submitted fields and database-generated fields.
 *                   properties:
 *                     _id:
 *                       type: string
 *                     trainer:
 *                       type: string
 *                       description: Authenticated trainer's user ID.
 *                     status:
 *                       type: string
 *                       enum: [draft]
 *                     publishedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Invalid or missing course fields, or unrecognized request properties. Returns JSON with status, message, and validation errors.
 *       401:
 *         description: Missing, invalid, or expired token. Returns JSON with status and message.
 *       403:
 *         description: Authenticated user is not a trainer. Returns JSON with status 403 and message Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.post(
    "/",
    authenticate,
    authorize(roles.TRAINER),
    validate(createCourseSchema),
    createCourse,
);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course's main information
 *     description: Only the trainer who owns the course can update it. All required fields must be supplied. Ownership and publication fields cannot be changed through this endpoint; admins are not allowed by the current role policy.
 *     tags:
 *       - Courses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Course MongoDB ObjectId.
 *         schema:
 *           type: string
 *         example: 68da12345678901234567890
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [title, description, level, category, estimatedDuration]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 description: Trimmed; must not be blank.
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 description: Trimmed; must not be blank.
 *               objectives:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 1
 *                   description: Trimmed; must not be blank.
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               category:
 *                 type: string
 *                 minLength: 1
 *                 description: Trimmed; must not be blank.
 *               estimatedDuration:
 *                 type: number
 *                 minimum: 1
 *           example:
 *             title: JavaScript Updated
 *             description: Updated course description
 *             objectives: [Learn functions]
 *             level: beginner
 *             category: Development
 *             estimatedDuration: 90
 *     responses:
 *       200:
 *         description: Course updated; ownership and publication fields are preserved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Course updated successfully
 *                 data:
 *                   type: object
 *                   description: Updated course document, including its trainer ID and database-generated fields.
 *       400:
 *         description: Invalid course ID, invalid or missing fields, or unrecognized body properties. Returns JSON with status and message; body validation errors also include errors.
 *       401:
 *         description: Missing, invalid, or expired token. Returns JSON with status and message.
 *       403:
 *         description: User is not a trainer (Forbidden), or the trainer does not own the course (You are not authorized to update this course). Returns JSON with status and message.
 *       404:
 *         description: Course does not exist. Returns JSON with status 404 and message course not found.
 *       500:
 *         description: Internal server error.
 */
router.put(
    "/:id",
    authenticate,
    authorize(roles.TRAINER),
    validate(createCourseSchema),
    updateCourse,
);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete an empty course
 *     description: Permanently deletes a course only when the authenticated trainer owns it and no modules or enrollments reference it. Admins are not allowed by the current role policy. No request body is required.
 *     tags:
 *       - Courses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Course MongoDB ObjectId.
 *         schema:
 *           type: string
 *         example: 68da12345678901234567890
 *     responses:
 *       200:
 *         description: Course permanently deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Course deleted successfully
 *       400:
 *         description: Invalid course ID. Returns JSON with status 400 and message Invalid ID.
 *       401:
 *         description: Missing, invalid, or expired token. Returns JSON with status and message.
 *       403:
 *         description: User is not a trainer (Forbidden), or the trainer does not own the course (You are not authorized to delete this course). Returns JSON with status and message.
 *       404:
 *         description: Course does not exist. Returns JSON with status 404 and message course not found.
 *       409:
 *         description: Course has associated modules or enrollments; nothing is deleted.
 *         content:
 *           application/json:
 *             example:
 *               status: 409
 *               message: Cannot delete course with associated modules or enrollments
 *       500:
 *         description: Internal server error.
 */
router.delete("/:id", authenticate, authorize(roles.TRAINER), deleteCourse);

/**
 * @swagger
 * /api/courses/{id}/{status}:
 *   patch:
 *     summary: Publish a course or return it to draft
 *     operationId: changeCourseStatus
 *     description: Only the trainer who owns the course can change its status. Publishing sets publishedAt. Returning to draft clears the date. If the course already has the requested status, returns 200 with an already-published or already-draft message and the unchanged course without saving. No request body is required.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the course owned by the authenticated trainer.
 *         schema:
 *           type: string
 *         example: 68da12345678901234567890
 *       - in: path
 *         name: status
 *         required: true
 *         description: Use published to publish the course or draft to unpublish it.
 *         schema:
 *           type: string
 *           enum: [published, draft]
 *         example: published
 *     responses:
 *       200:
 *         description: Course status updated, or course already has the requested status. The response includes the course document.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: Course document including its publication status and date.
 *                   properties:
 *                     _id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [published, draft]
 *                     publishedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *             examples:
 *               published:
 *                 summary: Course published (abbreviated course document)
 *                 value:
 *                   status: 200
 *                   message: Course status updated successfully
 *                   data:
 *                     _id: 68da12345678901234567890
 *                     status: published
 *                     publishedAt: '2026-10-14T10:00:00.000Z'
 *               draft:
 *                 summary: Course returned to draft (abbreviated course document)
 *                 value:
 *                   status: 200
 *                   message: Course status updated successfully
 *                   data:
 *                     _id: 68da12345678901234567890
 *                     status: draft
 *                     publishedAt: null
 *               alreadyPublished:
 *                 summary: Already published; date remains unchanged
 *                 value:
 *                   status: 200
 *                   message: Course is already published
 *                   data:
 *                     _id: 68da12345678901234567890
 *                     status: published
 *                     publishedAt: '2026-10-14T10:00:00.000Z'
 *               alreadyDraft:
 *                 summary: Already a draft
 *                 value:
 *                   status: 200
 *                   message: Course is already a draft
 *                   data:
 *                     _id: 68da12345678901234567890
 *                     status: draft
 *                     publishedAt: null
 *       400:
 *         description: Invalid ID (Invalid ID) or unsupported status (Status must be published or draft). Returns JSON with status and message.
 *       401:
 *         description: Missing, invalid, or expired Bearer token. Returns JSON with status and message.
 *       403:
 *         description: User is not a trainer (Forbidden) or does not own the course (You are not authorized to change this course's status). Returns JSON with status and message.
 *       404:
 *         description: Course not found. Returns JSON with status 404 and message Course not found.
 *       500:
 *         description: Internal server error.
 */
router.patch("/:id/:status", authenticate, authorize(roles.TRAINER), changeCourseStatus);

module.exports = router;
