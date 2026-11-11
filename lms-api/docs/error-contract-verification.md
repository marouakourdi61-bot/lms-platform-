# FAL-179 — Error contract verification

Verified on 21 October 2026 (Africa/Casablanca), on branch `feature/B3-unify-json-errors-validations`, against base commit `0afd727` plus the new test file in the working tree.

## Result

- New contract suite: **21 tests passed**.
- Full regression suite: **62 tests passed across 5 suites**. Final run: 12.728 seconds, exit code 0.
- JavaScript syntax and whitespace checks passed.
- Tests use Supertest with the actual exported Express app and local MongoDB on port 27017, database `lms_test`.
- Existing helpers create uniquely named test accounts and delete their associated test records afterward. No application database reset was used.

## Reproduce

Install project dependencies and ensure local MongoDB is running. The existing `.env` must provide a `JWT_SECRET`; do not include its value in evidence or PR text.

The process-local override below selects the test database without editing `.env`:

```powershell
$env:MONGO_TEST_URI = 'mongodb://127.0.0.1:27017/lms_test'
npm test -- --runTestsByPath tests/error-contract.test.js
npm test
```

The test setup explicitly selects `lms_test`. Fixtures write and remove test-owned records there. The new suite creates `uploads/` if needed; Multer and the upload controller clean up the rejected files.

## Status and JSON evidence

Tests assert the HTTP status and JSON body. Non-validation responses are checked for exactly `status` and `message`; validation responses require an `errors` array containing only `field` and `message` per entry.

| Case | Route | Expected evidence | Method |
| --- | --- | --- | --- |
| Invalid email | `POST /api/auth/register` | 400, `Validation error`, email field details | Real request and Zod validation |
| Malformed JSON | `POST /api/auth/login` | 400, `Invalid JSON`, no submitted password or parser details | Real JSON parser |
| Invalid ID format | `GET /api/courses/invalid-id` | 400, `Invalid ID` | Real Mongoose query casting |
| Mongoose validation | `GET /api/courses/:id` | 400, normalized field details | Real Mongoose validation error deliberately injected into the query |
| Missing, malformed, invalid, expired authorization | `GET /api/auth/me` | 401 and the appropriate public message | Real authentication middleware and JWT verification |
| Wrong password | `POST /api/auth/login` | 401, `Invalid email or password`, no user data | Real account lookup and password comparison |
| Wrong role | `GET /api/trainer/courses` | 403, `Forbidden` | Real learner login and authorization |
| Missing enrollment | `GET /api/courses/:id/modules` | 403 with matching JSON status | Real database lookup |
| Resume without enrollment | `GET /api/courses/:id/resume` | 403, service `error.status` preserved | Real service/database path |
| Unknown route | `GET /api/contract-route-does-not-exist` | 404 and route-not-found message | Real fallback middleware |
| Missing course | `GET /api/courses/:id` | 404, `Course not found` | Generated valid ObjectId, real database query |
| Progress without enrollment | `GET /api/courses/:id/progress` | 404, service `error.status` preserved | Real service/database path |
| Duplicate email | `POST /api/auth/register` | 409, `Email already registered` | Real existing test account |
| Duplicate enrollment | `POST /api/courses/:id/enroll` | First request 201, repeat 409 with matching body | Real database writes and lookup |
| Oversized upload | `POST /api/modules/:id/resources/upload` | 413, `File must not exceed 5 MB` | Real multipart upload of 5 MiB + 1 byte through Multer |
| Invalid upload order | Same upload route | 400, `Validation error`, order field details | Real multipart request and upload validator |
| Unexpected server failure | `GET /api/modules/:id/resources` | 500, `Internal server error`; original error logged | Deliberately rejected resource query, log assertion |
| Explicit server failure | Same resource route | 503, `Internal server error`; original error logged | Deliberately rejected query with `statusCode: 503` |

## Boundaries

- The 500/503 tests inject failures; they do not cause an actual database outage.
- The Mongoose validation test injects an actual validation-error object to exercise normalization through HTTP; it does not bypass production validation rules.
- Upload tests sign a short-lived trainer token for an existing test trainer; learner tests use the real login fixture.
- These results verify the local app source. Docker/deployed environments, every possible endpoint/input combination, and React integration were not tested.
- Backend team approval of the draft contract is still pending.

## PR handoff

Suggested title: `test: verify API error status and JSON contract (FAL-179)`

Suggested description:

> Add 21 Supertest contract checks for validation, authentication, authorization, missing resources, conflicts, uploads, and safe server-error responses. Verify both HTTP statuses and JSON bodies, including services that set error.status. Document reproducible commands and distinguish injected failures from real database-backed requests.
>
> Validation: 62 tests passed across 5 suites using local MongoDB on port 27017 with lms_test.

PR creation and merge are left to the user. No PR URL exists yet. After creating the PR, link it and this evidence document to FAL-179; record team review and merge before closing the delivery story.
