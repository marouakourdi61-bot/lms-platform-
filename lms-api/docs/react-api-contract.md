# React API contract

| Contract metadata | Value |
| --- | --- |
| Consumer | LMS React frontend |
| Document revision | 0.4 draft - 29 October 2026 |
| Backend baseline | Integrated commit `de43520`; API sources also checked against team main `384eb76` |
| Tracking | FAL-161; scope FAL-188, examples FAL-189, handoff FAL-190 |
| Approval | Pending backend/frontend agreement |
| API URL version | Routes currently use `/api`, with no `/v1` prefix |

This contract describes what React can send, what it receives, and which
access rules apply. It follows the presentation's endpoint-card approach:
**request, success, error, access**, with explicit field types and evidence.
It describes the existing interface; proposed policy changes stay in the
decision register below.

Use this document for integration, [Swagger UI](http://localhost:3000/api-docs/)
for the complete operation/schema reference, and FAL-163 for the separate
replayable API collection. None of these replaces checking the running service.

**Start here:** [connection](#2-connection-and-authentication),
[response formats](#3-response-conventions),
[endpoint cards](#4-endpoint-cards),
[demo setup](#5-demo-setup-and-replay),
[open decisions](#6-gaps-and-decisions-to-confirm),
[delivery checklist](#8-delivery-checklist-and-evidence).

Reviewers: see the [FAL-190 handoff and consistency review](react-api-contract-handoff.md)
for the checked revisions, discrepancies, test results and remaining delivery steps.

## 1. Scope

The contract covers the existing routes needed for the learning and trainer
screens below. Paths include `/api`; `{id}` placeholders must be replaced
with the corresponding record IDs. Swagger remains the complete endpoint
reference, including fields and endpoint-specific errors.

| React journey | Existing endpoints | Current access |
| --- | --- | --- |
| Register, log in, load profile | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | Register/login are public; profile requires a token. Registration creates a learner. |
| Browse catalogue and course details | `GET /api/courses`, `GET /api/courses/{id}` | Public published courses. Catalogue accepts `category`, `level`, `keyword`, `sortBy`. |
| Enroll and show my courses | `POST /api/courses/{courseId}/enroll`, `GET /api/enrollments/me` | Any authenticated account; enrollment has no learner-role restriction. Course must be published. |
| Read learning content | `GET /api/courses/{id}/modules`, `GET /api/modules/{id}/resources` | Modules require active enrollment; resource listing is public in the current implementation. |
| Track course progression | `GET /api/courses/{courseId}/progress` | Active or completed enrollment for the caller; recalculates and saves progress. See card 4.8. |
| Read quizzes and submit/view attempts | `GET /api/quizzes/{quizId}`, `POST /api/quizzes/{quizId}/attempts`, `GET /api/quizzes/{quizId}/attempts` | Read/submit: learner only. Attempt history also permits the course-owner trainer. Submission has fewer prerequisite checks than reading. See card 4.5. |
| Create, read and update feedback | `POST /api/feedback`, `GET /api/feedback/{feedbackId}`, `PATCH /api/feedback/{feedbackId}` | Create: course-owner trainer. Read: recipient, current owner or admin. Update: current owner or admin. See card 4.6. |
| Read trainer statistics | `GET /api/trainer/stats` | Trainer only; cached snapshot, with explicit no-data state. See card 4.7. |

These are the selected journeys for this draft. Detailed trainer content CRUD
and additional screens remain in OpenAPI until the team agrees their contract scope.

| Consult resources and complete modules | `POST /api/modules/{resourceId}/consult`, `POST /api/modules/{moduleId}/complete` | Active enrollment. Module completion also checks resources, previous module and any active mandatory quiz. The consult URL uses a resource ID despite its `/modules` prefix. |
| Track and resume learning | `GET /api/courses/{courseId}/progress`, `GET /api/courses/{courseId}/resume` | Active or completed enrollment. Both recalculate and save enrollment progress. |
| Read and submit a quiz | `GET /api/quizzes/{quizId}`, `POST /api/quizzes/{quizId}/attempts` | Learner only. Quiz reading checks enrollment/publication/unlock conditions; submission currently does not apply all those checks. |
| Show quiz attempts | `GET /api/quizzes/{quizId}/attempts` | Learner: own attempts. Course-owner trainer: attempts for that quiz. Admin refused. |
| Manage trainer courses | `GET /api/trainer/courses`, `POST /api/courses`, `PUT /api/courses/{id}`, `DELETE /api/courses/{id}`, `PATCH /api/courses/{id}/{status}` | Trainer; course updates, deletion and status changes require ownership. Status route accepts `draft` or `published`. |
| Manage modules | `POST /api/courses/{id}/modules`, `PUT /api/courses/modules/{moduleId}`, `DELETE /api/courses/modules/{moduleId}`, `PATCH /api/courses/modules/{moduleId}/status/{status}` | Trainer; ownership rules vary by operation. The status route checks ownership and currently validates a full module body. |
| Manage resources and uploads | `POST /api/modules/{id}/resources`, `PUT /api/modules/{id}/resources/{resourceId}`, `DELETE /api/modules/{id}/resources/{resourceId}`, `POST /api/modules/{id}/resources/upload` | Trainer. Upload requires course ownership; URL-resource create/update/delete currently check role without course ownership. |
| Manage quizzes | `POST /api/quizzes`, `PATCH /api/quizzes/{quizId}` | Course-owner trainer only. Private answer fields belong to these trainer operations, not learner responses. |
| Give and read feedback | `POST /api/feedback`, `GET /api/feedback/{feedbackId}`, `PATCH /api/feedback/{feedbackId}` | Create: course-owner trainer, valid course/module and active/completed learner enrollment. Read: recipient, current course owner or admin. Update comment: current course owner or admin. |
| Show trainer learners and progress | `GET /api/trainer/courses/{courseId}/learners`, `GET /api/trainer/courses/{courseId}/learners/{learnerId}/progress` | Course-owner trainer; active/completed enrollments. |
| Show trainer statistics and preferences | `GET /api/trainer/stats`, `GET /api/trainer/summary-preferences`, `PATCH /api/trainer/summary-preferences` | Trainer only. Statistics are cached; check `dataAvailable` and `refreshedAt`. Reading preferences may create defaults. |

Admin notification settings and manual job controls are documented in Swagger
but are outside this first learning/trainer screen scope. A dedicated admin
screen contract requires a team decision. Their existing response differences
are still recorded below so they are not mistaken for standard `data` responses.

## 2. Connection and authentication

- Development base URL: `http://localhost:3000`. The server reads `PORT`, so
  confirm the running environment. The base URL does not already include `/api`.
- Swagger UI: `http://localhost:3000/api-docs/`.
- JSON request bodies use `Content-Type: application/json`. Uploads use
  `multipart/form-data`; the browser must supply the multipart boundary.
- Login returns the JWT in `data.token` and the account in `data.user`.
  Protected requests send `Authorization: Bearer <token>`. The JWT middleware
  reads identity from `sub` and role from `role`; it does not use a session cookie.
- A missing, invalid or expired token returns HTTP 401. An authenticated caller
  refused by the role policy receives HTTP 403. Ownership and enrollment checks
  can also refuse access; exact 403/404 behavior is endpoint-specific.
- Roles are `learner`, `trainer`, and `admin`. Admin is not a universal bypass:
  trainer-only statistics/preferences and learner-only quiz reading/submission
  also refuse admins.
- Registration always creates a learner. Login refuses suspended accounts.
  General JWT middleware does not reload the account on every request, so do
  not describe suspension or role changes as immediate token revocation.
- No refresh-token, logout or password-reset route is currently mounted.
  Token expiry is configured by `JWT_EXPIRES_IN`; do not hard-code a lifetime.
- Browser token storage and re-login behavior need frontend/backend agreement.
  This document does not select a storage mechanism.

## 3. Response conventions

Read the HTTP status first. A JSON `status` property is not present on every
endpoint. Do not assume that all successful responses contain `data`, or that
all error responses contain `status`.

| Response shape | Current examples / meaning |
| --- | --- |
| `{ status, message, data }` | Auth register/login/profile, quiz operations/attempts, feedback and some course/resource mutations. `status` is numeric; account `data.status` is a separate string such as `active`. |
| `{ message, data }` | Trainer statistics/preferences, trainer courses/learners, progress/resume and several module operations. `data` may be an object or array, depending on the endpoint. |
| `{ count, data }` | Catalogue, published module and resource lists; `count` is the returned list length, not a pagination total. |
| `{ data }` | Published course detail. |
| `{ message, enrollment }` | Successful enrollment creation. The record is under `enrollment`, not `data`. |
| Plain array | `GET /api/enrollments/me` returns the enrollment array directly, with populated `course` documents. |
| `{ status, message }` or `{ message }` | Some successful deletions and errors. Do not require `data`. |
| `{ config }` | Admin notification configuration create/read/update. |
| `{ count, executions }` | Admin job execution history. |
| `{ message, execution }` | Admin manual job execution. |
| Empty body | HTTP 204 when deleting notification configuration. Do not attempt JSON parsing on this response. |

JSON IDs are strings. Auth responses use `id`; many Mongoose-backed documents
use `_id`. Keep the names documented for each operation. Timestamps are JSON
date strings and can be null where documented. Preserve numeric zero and
boolean false values; they do not mean a field is missing.

Response messages currently contain both English and French. They are display
text, not stable machine-readable error codes. A shared React request helper
must preserve endpoint-specific payloads rather than invent a backend envelope.

### Types, missing values and lists

| Convention | What React should expect |
| --- | --- |
| Record IDs | A 24-character hexadecimal string for MongoDB records. Question/choice IDs such as `q1` and `a` are different string identifiers. |
| Dates | ISO 8601 JSON strings, for example `2026-10-28T09:00:00.000Z`. Parse for display; do not depend on a display timezone in the API string. |
| Nullable fields | `publishedAt` may be null, as may statistics `refreshedAt` and resume `currentModule`/`nextModule`. Null is an explicit value, not a missing property. |
| Optional fields | Accept an absent optional field. Extra serialization metadata such as `__v` is not a UI dependency. |
| Empty lists | A successful list can contain `[]`. This is an empty-state screen, not automatically an error. |
| Pagination | Catalogue/modules/resources/enrollments/attempts expose no `page`, `size`, `totalPages` or server pagination contract. Do not copy the presentation's illustrative paginated shape into these routes. |
| Job history limit | Admin job history accepts `limit` (default 20, clamped to 1..100); this is a limit, not page navigation. |
| Percentages | Progress and quiz scores are numeric values from 0 to 100, not fractions from 0 to 1. |

In the cards, **required** means the key is expected in that operation's
current successful response or accepted request. It does not promise identical
fields across other operations. Examples use fictitious IDs and dates; they
are not seeded-record lookups or proof of execution.

### Error handling

The central error handler returns numeric `status` and string `message`.
Validation failures may also contain an `errors` array of `{ field, message }`.
Some direct controller errors still return only `message`, including missing
notification configuration and a missing enrollment user record.

| HTTP status | React-facing meaning |
| --- | --- |
| 400 | Invalid JSON, ID or input; can also mean a learning prerequisite is unmet. Use `errors` for field details when present. |
| 401 | Missing/invalid/expired authentication, or incorrect login credentials. |
| 403 | Refused role, ownership, enrollment/unlock policy, or suspended account at login. |
| 404 | Missing route or record; some ownership checks deliberately return 404 too. |
| 409 | Conflict such as an existing email, enrollment, quiz or referenced resource. |
| 413 | Upload exceeds the 5 MiB limit. |
| 500 | Unexpected failure; the central handler exposes a generic message, not internal error details. |

Middleware order matters: some body validators run before authentication.
An invalid unauthenticated request can therefore return 400 before reaching
the token check. Use the operation's actual policy rather than assuming 401
always takes priority. See [the error contract](error-contract.md) for the
existing error-format proposal and its verification boundaries.

## 4. Endpoint cards

These cards make the most common frontend calls explicit. They complement the
journey index and Swagger; they do not replace the full schema for every
trainer mutation. Each example below is **source-checked, not replayed in this
checkpoint**. Omitted serialization metadata is noted where applicable.

### 4.1 Log in and identify the current account

| Request | Value |
| --- | --- |
| Operation | `POST /api/auth/login` |
| Access | Public; account must be active |
| Headers | `Content-Type: application/json` |
| Path/query parameters | None |
| Body | Required object; extra keys are rejected |

| Request field | Type | Required | Rule |
| --- | --- | --- | --- |
| `email` | string | Yes | Valid email, trimmed and lowercased. |
| `password` | string | Yes | Non-empty. Use the local demo password when replaying. |

```json
{
  "email": "learner.demo@lms.local",
  "password": "LOCAL_DEMO_PASSWORD"
}
```

HTTP 200, illustrative response:

```json
{
  "status": 200,
  "message": "login successful",
  "data": {
    "token": "<jwt-from-login>",
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "email": "learner.demo@lms.local",
      "role": "learner",
      "status": "active"
    }
  }
}
```

The response requires `status: number`, `message: string`, `data: object`,
`data.token: string`, and `data.user: object`. Every shown user field is
required: `id` and `email` are strings, `role` is `learner | trainer | admin`,
and `status` is `active | suspended`.

Errors: 400 invalid body, 401 incorrect credentials, 403 suspended account,
500 unexpected failure. Incorrect credentials return
`{ "status": 401, "message": "Invalid email or password" }`.

Then call `GET /api/auth/me` with the Bearer token and no body or query.
HTTP 200 returns `{ status, message, data }`; `data` has required string fields
`id`, `name`, `email`, `role`, `status`, and no password. Errors: 401 invalid
authentication, 404 account not found, 500 unexpected failure.

Registration is `POST /api/auth/register`: required `name` (trimmed, at least
2 characters), valid `email`, and `password` (at least 8 characters). No `role`
field is accepted. HTTP 201 returns `{ status, message, data }` with
`data.id`, `name`, `email`, `role`, `status`; duplicate email returns 409.

### 4.2 List published courses - list response

| Request | Value |
| --- | --- |
| Operation | `GET /api/courses` |
| Access | Public |
| Body/path parameters | None |
| Success | HTTP 200 with `{ count, data }` |

| Query parameter | Type | Required | Meaning |
| --- | --- | --- | --- |
| `category` | string | No | Exact category filter. |
| `level` | string | No | Course level filter: `beginner`, `intermediate`, `advanced`. |
| `keyword` | string | No | Case-insensitive regular-expression search in title/description. |
| `sortBy` | string | No | `publishedAt` selects newest publication first; otherwise sorts by `createdAt` descending. |

Build query parameters with `URLSearchParams`, not string concatenation.
There is no server-side page/size parameter on this operation.

HTTP 200, illustrative response with serialization metadata omitted:

```json
{
  "count": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "trainer": "507f1f77bcf86cd799439013",
      "title": "Introduction to Node.js",
      "description": "Learn the Node.js basics.",
      "objectives": [],
      "level": "beginner",
      "category": "Backend",
      "estimatedDuration": 6,
      "status": "published",
      "publishedAt": null
    }
  ]
}
```

| Response field | Type | Presence / meaning |
| --- | --- | --- |
| `count` | integer | Required; number of returned courses. |
| `data` | Course[] | Required; empty result is `[]` with `count: 0`. |
| Course `_id`, `trainer` | string | Required record IDs. |
| Course `title`, `description`, `category` | string | Required content fields. |
| Course `level` | string enum | Required: `beginner`, `intermediate`, `advanced`. |
| Course `estimatedDuration` | number | Required, at least 1. The API field does not encode a unit; confirm the UI label with the team. |
| Course `objectives` | string[] | Current model defaults to `[]`. |
| Course `status` | string enum | This public list selects `published`; the model also supports `draft` and `archived`. |
| Course `publishedAt` | ISO string or null | Current model defaults to null; a seeded published course can have null here. |
| `createdAt`, `updatedAt`, `__v` | date strings / integer | May appear on serialized documents; not shown above. |

Errors: 500 unexpected failure. No matches return a successful empty list.

### 4.3 Read a published course - single resource

| Request | Value |
| --- | --- |
| Operation | `GET /api/courses/{id}` |
| Access | Public; returns published courses only |
| Path | Required `id: string`, 24 hexadecimal characters |
| Query/body | None |
| Success | HTTP 200 with `{ data: Course }`; the Course fields are defined in 4.2 |

The wrapper has only the required `data` object. Do not read a course title
from `response.title` or expect a top-level `message`.

Errors: 400 malformed ID; 404 missing or non-published course; 500 unexpected
failure. The 404 payload is
`{ "status": 404, "message": "Course not found" }`.

### 4.4 Enroll and load the learner's course list

| Request | Value |
| --- | --- |
| Operation | `POST /api/courses/{courseId}/enroll` |
| Access | Any authenticated account; course must be published |
| Path | Required `courseId: string` ObjectId |
| Body/query | None; learner identity comes from the token |
| Success | HTTP 201 with `{ message: string, enrollment: object }` |

The enrollment record contains `_id`, `learner`, `course` (string IDs),
`status` (`active | completed | cancelled`), and `progress` (number, 0..100).
New enrollment uses `active` and zero progress. Serialized records also
include timestamps and may include `__v`.

Errors: 400 invalid ID or unpublished course, 401 invalid authentication,
404 missing course/user, 409 duplicate enrollment, 500 unexpected failure.
The unique learner/course pair can also prevent re-enrollment when an older
record exists. Do not promise a cancellation/re-enrollment workflow.

To load enrollments, call `GET /api/enrollments/me` with the token and no
parameters/body. HTTP 200 is a **plain Enrollment[]**, not `{ data: [...] }`.
Its `course` field is populated with a Course document and can be null if the
referenced course no longer exists. No enrollments means `[]`. Errors: 401, 500.

### 4.5 Submit a quiz - evaluation result

| Request | Value |
| --- | --- |
| Operation | `POST /api/quizzes/{quizId}/attempts` |
| Access | Learner token only; trainer/admin receive 403 |
| Path | Required `quizId: string` ObjectId |
| Headers | Bearer token and `Content-Type: application/json` |
| Query | None |
| Body | Required object with `answers: array`; extra keys are rejected |

Each answer requires non-empty string `questionId` and `choiceId`; extra
answer keys are rejected. An empty `answers` array is accepted and scores zero.

```json
{
  "answers": [
    { "questionId": "q1", "choiceId": "a" }
  ]
}
```

HTTP 201, illustrative result for a one-question quiz with a correct answer.
Timestamps, `__v` and answer subdocument `_id` metadata are omitted:

```json
{
  "status": 201,
  "message": "quiz attempt submitted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "learner": "507f1f77bcf86cd799439012",
    "quiz": "507f1f77bcf86cd799439015",
    "answers": [
      { "questionId": "q1", "choiceId": "a" }
    ],
    "correctCount": 1,
    "totalQuestions": 1,
    "scorePercent": 100,
    "passed": true
  }
}
```

| Required result field | Type | Meaning |
| --- | --- | --- |
| `_id`, `learner`, `quiz` | string | Attempt, current learner and quiz IDs. |
| `answers` | object[] | Submitted choices; not the answer key. |
| `correctCount` | integer | Correctly answered questions, at least 0. |
| `totalQuestions` | integer | Quiz question count, at least 1. |
| `scorePercent` | number | Backend-calculated percentage, 0..100, rounded to two decimals. |
| `passed` | boolean | Whether score meets the quiz passing threshold. It is not a status string. |

HTTP 201 means the attempt was saved, even when `passed` is false. Do not
calculate or override the official score in React. A wrong choice or omitted
question scores zero for that question; submitting again creates another attempt.

Errors: 400 invalid ID/body, 401 invalid authentication, 403 wrong role,
404 quiz missing, 500 unexpected failure. The submission route currently lacks
the enrollment/publication/unlock checks used by quiz reading. This difference
is a backend gap, not an alternative frontend authorization mechanism.

Read the quiz first with `GET /api/quizzes/{quizId}`. HTTP 200 returns
`{ status, message, data }`, where `data` includes `_id`, `moduleId`, `title`,
`passingScore`, `isRequired`, `isActive`, and `questions[]`. A question has
string `id`, string `text`, and `choices[]` containing string `id` and `text`.
There is no `correctChoiceId` in the learner response. Reading requires active
enrollment, published course/module, active quiz and previous-module completion
where applicable (403 when refused).

`GET /api/quizzes/{quizId}/attempts` returns
`{ status, message, data: Attempt[] }`, newest first. Learners receive their
own attempts; course-owner trainers receive attempts for that quiz; admins
are refused. Query parameters cannot select another learner's attempts.

### 4.6 Update a feedback comment

| Request | Value |
| --- | --- |
| Operation | `PATCH /api/feedback/{feedbackId}` |
| Access | Current course-owner trainer or admin |
| Path | Required `feedbackId: string` ObjectId |
| Headers | Bearer token and `Content-Type: application/json` |
| Query | None |
| Body | Only required `comment: string`; trimmed, non-empty |
| Success | HTTP 200 with `{ status: number, message: string, data: Feedback }` |

```json
{
  "comment": "Good progress. Review the second exercise."
}
```

Feedback has required string fields `_id`, `trainer`, `learner`, `course`,
`module`, `comment`; serialized records include timestamps and may include
`__v`. Success message: `Feedback updated successfully`. Associations stay
unchanged; do not send them in the PATCH body.

Errors: 400 invalid ID/blank comment/extra fields, 401 invalid authentication,
403 learner or unrelated trainer, 404 missing feedback/course, 500 unexpected
failure. Role and ownership checks can stop a request before other validations.

To create feedback, `POST /api/feedback` requires string ObjectIds `learner`,
`course`, `module` plus non-empty `comment`; the course owner must be the
trainer caller, the module must belong to that course, and the learner must
have active/completed enrollment. No caller-supplied `trainer` is accepted.
HTTP 201 returns `{ status, message, data: Feedback }`.

`GET /api/feedback/{feedbackId}` returns the same wrapper at HTTP 200 for the
recipient learner, current course-owner trainer or admin. There is no mounted
feedback-list route; the frontend needs an existing feedback ID to read one.

### 4.7 Read trainer statistics

| Request | Value |
| --- | --- |
| Operation | `GET /api/trainer/stats` |
| Access | Trainer token; learners and admins receive 403 |
| Parameters/body | None; trainer identity comes from the token |
| Success | HTTP 200 with `{ message: string, data: object }` |

No snapshot yet is a successful response:

```json
{
  "message": "trainer statistics retrieved successfully",
  "data": {
    "dataAvailable": false,
    "refreshedAt": null,
    "courses": []
  }
}
```

| Required response field | Type | Meaning |
| --- | --- | --- |
| `data.dataAvailable` | boolean | Whether a successful statistics snapshot exists. |
| `data.refreshedAt` | ISO string or null | Snapshot completion date; null without a snapshot. |
| `data.courses` | object[] | Current owned courses; empty without a snapshot. |
| Course `courseId`, `courseTitle` | string | Course ID and display title. |
| Course `totalEnrollments` | integer | Enrollment count across all statuses. |
| Course `averageProgress` | number | Average percentage, rounded to two decimals. |
| Course `totalAttempts`, `passedAttempts` | integer | Counts across all quiz attempts, not distinct learners. |
| Course `averageScore` | number | Average score percentage, rounded to two decimals. |
| Course `feedbackCount` | integer | Feedback count. |

With a snapshot, `dataAvailable` is true and `courses` contains those metrics;
courses missing from the snapshot have zero values. Reading this endpoint
does not refresh statistics. Show separate no-data, empty-course and stale-data
states using these fields. There is no agreed maximum snapshot age yet.
Errors: 401 invalid authentication, 403 wrong role, 500 unexpected failure.

### 4.8 Read course progression

| Request | Value |
| --- | --- |
| Operation | `GET /api/courses/{courseId}/progress` |
| Access | Bearer token with an active or completed enrollment for that account |
| Path | Required `courseId: string` ObjectId |
| Body/query | None; learner identity comes from the token |
| Success | HTTP 200 with `{ message: string, data: object }` |

Illustrative request (replace the fictitious course ID and token):

```http
GET /api/courses/507f1f77bcf86cd799439011/progress
Authorization: Bearer <learner-token>
```

Illustrative response for two published modules and two resources, with one
module completed and one resource consulted:

```json
{
  "message": "Progression du cours récupérée avec succès",
  "data": {
    "courseId": "507f1f77bcf86cd799439011",
    "learnerId": "507f1f77bcf86cd799439012",
    "totalModules": 2,
    "completedModules": 1,
    "totalResources": 2,
    "consultedResources": 1,
    "percentage": 50,
    "enrollmentStatus": "active"
  }
}
```

Both IDs are strings; the four counts are integers, `percentage` is a number,
and `enrollmentStatus` is `active` or `completed`. Modules and resources have
equal weight: `(1 + 1) / (2 + 2) * 100 = 50`. With no published modules or
resources, the percentage is zero. Values are rounded to two decimal places.

This GET recalculates and saves enrollment progress; reaching 100 marks the
enrollment completed. It does not automatically change a completed enrollment
back to active if the percentage later drops. React should use the returned
status instead of deriving it from the percentage.

Errors: 400 invalid ID, 401 missing/invalid/expired token, 404 no active or
completed enrollment (including cancelled enrollment), 500 unexpected failure.
An illustrative 404 body is
`{ "status": 404, "message": "Inscription active introuvable" }`.
There is no learner-only role middleware on this route; access depends on the
token identity and its enrollment.

Evidence: source-checked against `controllers/courseProgressController.js`,
`services/courseProgressService.js` and `routes/enrollmentRoutes.js` on
29 October 2026. These IDs and response values are fictitious, not a replay
against the seeded demo account. Existing progression tests provide separate
behavior evidence; this card does not claim a fresh seed or HTTP replay.

### Endpoint-card standard for the remaining operations

For every additional screen, record the method/path, path/query/header fields,
body fields and requiredness, access/prerequisites, success status and typed
payload, error statuses, nullable/empty cases, and verification evidence.
Use the existing Swagger schema and validators; do not infer a request body
from a returned database document. Detailed trainer CRUD fields remain in
Swagger until their screen cards are written and reviewed.

## 5. Demo setup and replay

The seed defines these development accounts:

| Email | Role | Intended use |
| --- | --- | --- |
| `learner.demo@lms.local` | learner | Learning and quiz screens. |
| `trainer.demo@lms.local` | trainer | Owned courses, feedback and statistics. |
| `admin.demo@lms.local` | admin | Explicit admin routes; not a trainer substitute. |

The password comes from local `SEED_DEMO_PASSWORD` (at least eight characters).
It is not embedded in this contract. The seed creates three published courses,
published modules/resources, quizzes and learner progress/attempt fixtures.
The demo learner is enrolled in the first Node.js course.

The first course starts with two published modules and two resources. One
resource is consulted and one module completed, giving 50% progress. The
seeded quiz has three questions and two existing attempts (33.33% failed and
66.67% passed). Card 4.5 instead illustrates a fictitious one-question quiz;
submitting its one-answer request to the seed quiz does not produce 100%.
Use the live learner quiz response when composing a demo submission.

The seed creates no feedback records and no successful statistics-refresh
job. A feedback read/update requires an ID supplied by the backend owner or
returned from an authorized feedback creation. A populated statistics example
requires an existing successful refresh; otherwise use the documented no-data
state. Existing database records can affect these starting conditions.

The existing `npm run seed` command **replaces the matching demo course data
and related records and resets the demo account passwords**. Ask the backend
owner for a prepared development database or arrange a deliberate reset.
This documentation task did not run the seed. Do not assume those accounts
or example IDs already exist in the running environment.

After any reset, obtain current course IDs from `GET /api/courses` and module
IDs from the enrolled course's module list. Quiz and feedback ID discovery
still needs agreement; there is no list/lookup route for those flows.

Replay sequence for a prepared local environment:

1. Confirm the base URL and agreed browser proxy/CORS setup.
2. Log in with the appropriate demo role. Keep the token locally.
3. Read `/api/auth/me` and verify the returned account/role.
4. Load the catalogue, then the learner's enrollments. An existing enrollment
   means another enrollment POST can correctly return 409.
5. Replace placeholder IDs with current records before trying a card.
6. Compare HTTP status, wrapper, fields, types and access behavior with the card.
   Record the date, backend revision, role and result without saving secrets.

This browser-console example performs login and public/profile reads only.
Run it from the agreed frontend origin; it is a usage example, not a recorded
execution. Enter the local demo password when prompted.

```javascript
const baseUrl = "http://localhost:3000";
const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "learner.demo@lms.local",
    password: prompt("Local demo password")
  })
});
const loginBody = await loginResponse.json();
if (!loginResponse.ok) throw new Error(loginBody.message || "Login failed");
const token = loginBody.data.token;

const profileResponse = await fetch(`${baseUrl}/api/auth/me`, {
  headers: { Authorization: `Bearer ${token}` }
});
const profileBody = await profileResponse.json();
if (!profileResponse.ok) throw new Error(profileBody.message || "Profile failed");
console.log(profileBody.data.role);

const coursesResponse = await fetch(`${baseUrl}/api/courses`);
const coursesBody = await coursesResponse.json();
if (!coursesResponse.ok) throw new Error(coursesBody.message || "Catalogue failed");
console.log(coursesBody.data);
```

For a shared request helper, preserve the original payload after checking
`response.ok`. Handle HTTP 204 before calling `.json()`. Do not automatically
retry POST enrollment, quiz attempt, upload or job execution requests: a retry
can create another write or encounter a conflict. Network/CORS failures have
no readable API error payload and need a separate UI error state.

FAL-163 owns the importable Postman/Insomnia collection and environment.
The examples here do not claim that collection has been delivered or run.

## 6. Gaps and decisions to confirm

| Item | Current evidence / decision needed |
| --- | --- |
| Browser connection | `app.js` configures no CORS middleware. Agree a development proxy/same-origin setup or separately scoped backend configuration before claiming cross-origin React access works. |
| Response normalization | Confirm how the React request layer handles the different envelopes above. Do not silently change backend responses in this documentation task. |
| Enrollment policy | Current enrollment creation accepts any authenticated role. Confirm whether product requirements want learner-only access; document current behavior until changed. |
| Content ownership | Resource listing is public; some trainer content mutations lack owner checks. Confirm desired policy separately rather than promising stronger protection to React. |
| Quiz prerequisites | Submission and attempt history do not enforce all quiz-read conditions. Keep this difference visible until the backend team resolves it. |
| Missing journeys | No mounted enrollment cancellation, private-file download, user/role administration, token refresh or password reset endpoint. Do not build a contract around guessed URLs. |
| Quiz discovery | Learner quiz reading needs a `quizId`; agree how each screen obtains it from the available payloads/demo data. No quiz-by-module lookup route is mounted. |
| Seed and examples | Seed account names and representative examples are documented above; actual environment IDs and replay evidence remain to be recorded under FAL-189. |
| Feedback discovery | Create returns the new feedback ID; there is no mounted learner/course feedback listing endpoint. Agree how the learner screen obtains existing IDs. |
| Cached statistics | A successful HTTP response can contain no snapshot. A snapshot can be older than current records. Decide loading/empty/stale states using `dataAvailable`, `refreshedAt` and `courses`. |
| Delivery agreement | Team approval, final screen selection and React integration remain pending. FAL-190 checks consistency; a local document alone is not merged delivery. |

## 7. Compatibility and change agreement

The document revision is not an API URL version. Do not prepend `/v1` or
invent a version header. Proposed change handling for team agreement:

- An added optional response field is normally compatible if existing names,
  types and meanings remain unchanged and clients tolerate unknown fields.
- Renaming/removing fields, changing an object into an array, changing date or
  null formats, making optional request fields required, changing an error
  status, or tightening access can break a consumer. Coordinate these changes
  before releasing them to the frontend.
- Update the contract, OpenAPI and replayable requests together. Record the
  changed operation and example plus the backend revision.
- Backend/frontend reviewers should agree any breaking change and its migration
  before deployment. This is a proposed working agreement, not proof that a
  versioning/review process already runs.

## 8. Delivery checklist and evidence

| Check | Current state |
| --- | --- |
| Scope, endpoint index and authentication documented | Source-checked in this document. |
| Existing response wrappers and non-paginated lists described | Source-checked; keep endpoint differences visible. |
| Representative request/success/error/access cards and field types | Included above; fictitious examples, not a full replay. |
| Consistency with integrated routes, OpenAPI and demo seed | Checked on 29 October 2026; see the [FAL-190 handoff](react-api-contract-handoff.md). |
| Every planned React screen has a complete card | Pending final screen selection and remaining detailed trainer CRUD cards. |
| Seed accounts, setup impact and ID dependencies explained | Source-checked; seed not run in this checkpoint. |
| Importable request collection and environment | Separate FAL-163 delivery; not claimed here. |
| Request replay matches contract | Pending recorded environment-specific execution. Existing feature tests are separate evidence. |
| Backend/frontend agreement and review | Pending. |
| Contract committed, reviewed and merged to team main | Pending for this document revision. |

Checks performed for revision 0.4 on 29 October 2026:

- Compared API source with freshly fetched team main `384eb76`. Its only
  change since integrated `de43520` is the Docker seed-password environment
  mapping; the API, validators, OpenAPI and seed implementation are unchanged.
- Corrected the progression 404 example to include numeric `status`.
- Completed the selected-journey index and clarified seed/example differences.
- Full existing regression suite passed: 230 tests across 20 suites.
- Detailed consistency checks and review instructions are recorded in the
  [FAL-190 handoff](react-api-contract-handoff.md).

Checks performed for revision 0.3 on 29 October 2026:

- Added the source-checked course progression card, including calculation,
  enrollment side effects, access and errors. No seed replay was performed.
- All eight JSON examples parse; whitespace checks passed.
- Existing Swagger tests passed (20 tests), and existing progression tests
  passed (13 tests) against the isolated `lms_test` database.
- These automated checks do not replace environment-specific example replay
  or backend/frontend approval.

Checks performed for revision 0.2 on 28 October 2026:

- All 55 method/path references in this document match generated OpenAPI
  operations (parameter names normalized for comparison).
- All seven JSON examples parse; the login, attempt-submission and feedback
  update request examples pass their existing Zod validators.
- Internal section links, local document links and the browser example's
  JavaScript syntax were checked. The browser example was not executed.
- The existing Swagger suite passed: 20 tests. No new test file was created.
- Whitespace checks passed. No fresh end-to-end replay or seed reset was run.

The presentation's delivery principle is applied directly: a documented
example is not a verified service response until the request has been replayed
and compared with it. Do not mark the complete FAL-161 handoff delivered while
the pending checks above remain unresolved.

This section is based on source and generated OpenAPI inspection, not a new
HTTP run of every journey. Sources: `app.js`, the mounted route files, their
controllers, `middlewares/authenticate.js`, `middlewares/authorize.js`,
`middlewares/errorHandler.js`, and `docs/swagger.js`.

Existing feature verification is recorded in
[OpenAPI verification](openapi-verification.md),
[error-contract verification](error-contract-verification.md),
[quiz-read verification](quiz-read-verification.md), and
[feedback verification](feedback-verification.md). These dated records may
describe earlier checkpoints; they do not prove a fresh run of every example.
FAL-189 must distinguish source-checked examples from replayed examples.

The presentation supplied the endpoint-card structure, the resource/list/result
distinction, compatibility guidance and delivery checklist. Its product URLs,
pagination format and `{ code, message }` error example are illustrative and
have not been adopted as LMS behavior.

No application behavior or automated test files are changed by this document.
