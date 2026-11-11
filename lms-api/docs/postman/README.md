# 📬 LMS API frontend handoff

> **FAL-163 — Locally verified on 30 October 2026.** Selected Postman journeys passed against an isolated database. Read [TESTS.md](./TESTS.md) for exact results and remaining delivery boundaries.

This package turns the supplied `lms` collection into a documented handoff for the React developer. It follows the current [API contract](../react-api-contract.md), generated [OpenAPI source](../swagger.js), and Brief 3 requirements. Existing application behavior is preserved; this package does not fix backend access-policy gaps.

## 🚀 Import and connect

1. Import [LMS-Frontend.postman_collection.json](./LMS-Frontend.postman_collection.json) and [Local-Docker.postman_environment.json](./Local-Docker.postman_environment.json).
2. Select **LMS — Local Docker**. Set `baseUrl` for the agreed backend. The default is `http://localhost:3000`; the older scheduling practice clone uses port `3002` and is not the integrated Brief 3 baseline.
3. Run **00 Public smoke**. Connection and catalogue should return 200; missing and deliberately invalid authentication should return 401. This folder needs no account or fixture IDs.
4. Put the existing demo passwords in your local environment, then run the required requests in **01 Role login**. Each role has a separate token and identity; failed login clears the old identity/token first.
5. Prepare linked IDs as described below, then select requests in **02 Frontend reading journeys**. Do not run the whole collection as a sequential test suite.

The environment is the single source of variable values. Remove duplicate variables of the same names from global, collection, or runner-data scopes. Do not paste a password or JWT directly into a request. Before exporting a used environment, clear passwords and tokens: marking a field secret only hides its display and does not guarantee a safe export.

## 🗂️ Why the collection is organized this way

| Folder | Purpose | Preparation |
| --- | --- | --- |
| `00 Public smoke` | Establish connectivity, catalogue response shape and authentication rejection behavior | Running API only |
| `01 Role login` | Keep learner, trainer and admin identity explicit | Existing accounts and local passwords |
| `02 Frontend reading journeys` | Show the requests a screen consumes, with role and prerequisites | Valid tokens and related fixture IDs |
| `03 API reference` | One request per documented operation, including job aliases | Choose operations individually; inspect prerequisites |
| `04 Access and validation scenarios` | Verify exact refusals, malformed payloads and upload limits | Distinct identities, linked negative fixtures and local upload files |
| `05 Disposable fixture setup` | Demonstrate dependent IDs without copying MongoDB IDs into URLs | Trainer/learner login and deliberate write opt-in |

Every request names its expected HTTP status, documents its role, checks the status and JSON response where applicable, and has a prerequisite script. Selected frontend responses also check catalogue shape, safe profile fields, quiz answer privacy and the statistics empty state. Only explicit OpenAPI examples are saved as examples; they are labeled illustrative, not observed responses.

## 🔑 Accounts and environment variables

| Variables | Meaning |
| --- | --- |
| `baseUrl` | Server root, without `/api` or a trailing slash |
| `learnerEmail`, `trainerEmail`, `adminEmail` | Default demo emails from the current seed |
| `learnerPassword`, `trainerPassword`, `adminPassword` | Local credentials; intentionally empty in Git |
| `learnerToken`, `trainerToken`, `adminToken` | Populated by the corresponding successful login |
| `learnerId`, `trainerId`, `adminId` | Captured from that login's `data.user.id` |
| `courseId`, `moduleId`, `resourceId`, `quizId`, `feedbackId` | A consistent fixture used by the frontend requests |
| `createdCourseId`, `createdModuleId`, `createdResourceId`, `createdQuizId`, `createdFeedbackId` | IDs returned by create requests; separate from existing fixtures |
| `otherLearnerToken`, `otherTrainerToken` | Distinct, valid accounts for refusal scenarios; obtain locally |
| `otherCourseModuleId` | Existing module belonging to another course, for the feedback mismatch case |
| `registrationEmail`, `registrationPassword` | Unique disposable learner account for registration, if chosen |
| `courseStatus`, `moduleStatus` | Default `published`; confirm intended status before patching |
| `jobName` | Default `stats` for the generic manual-job route |
| `allowWrites` | Default `false`; set locally to `true` only when intentionally exercising changes |

The seed defines `learner.demo@lms.local`, `trainer.demo@lms.local`, and `admin.demo@lms.local`. Their passwords come from the backend owner's local `SEED_DEMO_PASSWORD`. Account existence and passwords are not established merely by importing this environment.

**Do not run the seed automatically.** The existing seed can replace matching course data and reset demo passwords. Ask for a prepared development database or agree a reset separately.

## 🔗 Obtain related IDs

For existing data, get the course from `GET /api/courses` or the trainer's course list, then inspect the learner's enrollments and course modules. Use a module belonging to that course and a resource belonging to that module. The trainer must own the selected course; the learner must meet the requested route's enrollment/unlock rules.

There is no mounted quiz-list or feedback-list endpoint. Obtain those IDs from the backend owner or from an authorized create response. Never invent a list route or select an unrelated record merely because its ID looks valid.

For a new disposable fixture:

1. Log in as trainer and learner. Check both identities.
2. Set `allowWrites=true` and `courseStatus=published` in the local environment.
3. Run **05 Disposable fixture setup** once, in its numbered order. It creates a draft course, a published module, a link resource, and an active optional one-question quiz; publishes the course; then enrolls the learner.
4. Each create captures its `created...Id`. Only after successful enrollment are those linked IDs copied into `courseId`, `moduleId`, `resourceId`, and `quizId` for the reading journeys. `feedbackId` remains unset until feedback is created deliberately.
5. Set `allowWrites=false` afterward. Keep the returned IDs for review. Re-running creates another course; this folder does not delete records or reset data.

The fixture quiz uses question `q1`, choices `a`/`b`, and correct choice `a`. The reference attempt body matches that single-question example. For a seeded or other quiz, replace the answers with IDs from the live learner quiz response. The seed's three-question quiz is different; one answer does not imply a 100% score.

## 🧪 Run frontend journeys deliberately

Start with profile, catalogue, enrollments and course details. Continue with related modules/resources, quiz and attempts, then feedback and trainer statistics as those screens require. A `409` on repeat enrollment is expected only in the dedicated duplicate-enrollment scenario; it is not a successful first enrollment.

Read each request's description before running. Default guards skip a request when required environment variables are missing, or when it can change data and `allowWrites` is not `true`. **A skipped request is untested.** Postman's prerequisite skip mechanism is documented in [the Postman execution reference](https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-execution/).

Some GETs have side effects: progress/resume recalculate saved progress, and trainer preference reads can create defaults. They require the same opt-in. POST job requests may write execution records or send email. Configuration POST expects no existing singleton, GET/PATCH expect one to exist, and DELETE removes it; these are individual lifecycle scenarios, not a safe run-all sequence. Configuration deletion does not itself stop already registered cron jobs.

For uploads, select a local PDF/JPEG/PNG matching the scenario and choose the correct `file` field. The size case requires an allowed file larger than **5 MiB** and expects 413. Unsupported type and missing file expect 400. Let Postman set the multipart boundary. Absolute local file paths are not shared in the export.

## 🧩 What React must handle

- Login returns `data.token`; protected requests send a Bearer token. Tokens are role-specific.
- Catalogue returns `{ count, data }`; enrollments returns an array; enrollment creation returns `{ message, enrollment }`; admin configuration uses `{ config }`; job execution responses use `{ message, execution }`. Do not assume every endpoint has `data`.
- Statistics can validly return `dataAvailable: false`, `refreshedAt: null`, and empty courses. A report refresh is a separate action, not a hidden prerequisite for showing the empty screen.
- Missing/invalid authentication is 401; role/ownership/enrollment refusals depend on the endpoint. Admin is not a universal role bypass.
- Learner quiz responses must not expose answer keys. Quiz submission currently has fewer enrollment/publication checks than quiz reading; this is a recorded backend gap, not an assertion that the stricter policy exists.
- Public resource listing, variable ownership enforcement and API-browser CORS/proxy decisions remain documented in the [contract](../react-api-contract.md). Postman success alone does not verify browser integration.

## 📋 Brief 3 coverage and delivery

| Requirement | Package coverage | Remaining proof |
| --- | --- | --- |
| Brief 2 regression paths | Auth, courses, enrollments, modules, resources, uploads and progression | Replay selected success/refusal scenarios |
| Quiz, attempts, feedback and trainer statistics | API reference, reading journeys, privacy assertions and access scenarios | Linked fixtures and real execution results |
| Admin configuration, preferences, manual jobs and history | Complete reference including configuration CRUD and both job aliases | Authorized replay in the intended environment |
| Five email situations and templates | Registration, enrollment, inactive reminders and trainer summaries have actual API triggers | Four log-driver events observed. The required forgotten-password email journey has no mounted auth endpoint in the current backend; it remains a delivery gap. Quiz-completion email is not one of the five situations listed in the supplied brief. SMTP delivery is unverified. |
| Importable collection and environment | Both JSON exports included; empty exported credentials | Fresh import/replay by a second developer |
| Reproducible setup and frontend contract | This guide plus linked contract/seed instructions | Backend/frontend agreement and browser connection |
| Delivery on main with review | Files prepared and locally verified | User commit/push, PR review and team-main merge |

The saved brief source omits the detailed remainder of section 6; this package does not invent it. The current mounted routes, contract, and FAL-163 acceptance criteria supply the operational scope. The 54-operation reference includes aliases; it is not 54 distinct business capabilities.

## ✅ Before handing over

- Run and record the chosen paths, including both allowed and refused access.
- Save useful real examples only after removing tokens, passwords and identifying data.
- Update [TESTS.md](./TESTS.md) with backend revision, fixture prerequisites, counts, failures and skips.
- Clear local secrets before any new export. Share code through the normal reviewed delivery workflow.

No application code, seed records, credentials, Git commits, remote branches or Jira status are changed by importing this package.

### Command line smoke check

From the repository root, with Newman available:

```powershell
npx --yes newman run docs/postman/LMS-Frontend.postman_collection.json -e docs/postman/Local-Docker.postman_environment.json --folder "00 Public smoke" --reporters cli --timeout-request 10000
```

This selects only the four public/unauthenticated smoke requests. No login credentials or database reset are needed. The Postman desktop runner can run the same folder after import.
