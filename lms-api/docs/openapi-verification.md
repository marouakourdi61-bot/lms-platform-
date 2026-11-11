# FAL-186 / FAL-187 - Current route documentation

## FAL-187 follow-up - 28 October 2026

The documentation branch contains team `main` through `6df25d5` (merged in
`ffa21a5`). Comparing the integrated routes found one new operation:
`GET /api/trainer/stats`. OpenAPI now covers **54 operations across 40 paths**
with **24 shared schemas**. The route inventory check compares mounted and
documented operations in both directions.

The statistics documentation covers:

- Trainer-only access, including rejection of learner and admin tokens.
- The actual `{ message, data }` envelope and every course metric.
- Cached values from the latest successful global `statsRefresh` execution;
  reading statistics does not refresh them. `refreshedAt` exposes snapshot age.
- All current owned courses, including drafts and archived courses. Missing
  snapshot metrics default to zero. Enrollment metrics include all statuses;
  quiz metrics include every attempt. Averages are rounded to two decimals.
- HTTP 200 with `dataAvailable: false`, `refreshedAt: null` and `courses: []`
  when no successful snapshot exists, plus 401, 403 and sanitized 500 examples.

The existing documentation suite checks OpenAPI validation/reference resolution,
complete route coverage and Swagger UI HTTP 200. No new test file is included
in this documentation task.

Historical verification before narrowing scope: 236 tests across 21 suites
passed, including six temporary statistics-response checks. That temporary
test file was subsequently removed at the user's request; those six checks
are not part of the delivered suite.

```powershell
npm test -- --runTestsByPath tests/swagger.test.js
npm test
```

The changes add documentation and schemas only. The React API contract
is the next separate task. Local verification does not establish PR review,
merge of these documentation changes into team `main`, or Jira delivery.

## FAL-186 baseline - 27 October 2026

Verified locally on 27 October 2026.

## Coverage

The generated OpenAPI 3.0 specification covers **53 operations across 39 paths**.
All mounted application routes are covered, including public health/diagnostic
routes and both `/api/jobs` and `/api/admin/jobs` aliases. `/api-docs` serves
the documentation UI and is not an application operation in the specification.

New annotations cover quizzes, attempts, feedback, notification configuration,
execution history, trainer preferences and manual jobs. Existing module-completion
documentation now includes the active mandatory-quiz requirement.

Shared request/response schemas live in `docs/openapiSchemas.js`. Route-specific
annotations stay beside their routes. Specification discovery uses absolute
paths so it does not depend on the process working directory.

## Verification

- OpenAPI validation and reference resolution passed.
- A route inventory test checks both directions: no undocumented mounted
  operations and no documented operations that are not mounted.
- Eight request examples pass their actual Zod validators.
- Public health examples and anonymous errors match real Supertest responses.
- Swagger UI returns HTTP 200.
- Documentation suite: **20 tests passed**.
- Full regression: **229 tests across 19 suites passed**.
- Whitespace checks passed. Application/router changes contain comments only;
  endpoint logic, authentication and validation behavior were not changed.

```powershell
npm test -- --runTestsByPath tests/swagger.test.js
npm test
```

Restart the API after documentation changes, then open
`http://localhost:3000/api-docs/`.

## Current behavior and remaining scope

The specification describes actual response envelopes, including config/message
responses that do not use the status/message/data format. It distinguishes safe
learner quiz responses from private trainer quiz responses.

Existing implementation boundaries are documented: attempt submission does not
apply quiz-read enrollment/publication/unlock checks; the config validator accepts
`smtp` although the email service implements only `log` and `sandbox`; deleting
configuration does not itself stop registered cron tasks. These were not fixed
as part of this documentation task.

The checks above do not constitute exhaustive schema validation of every success
payload or a browser interaction test of every Swagger request. Existing feature
tests provide separate behavior coverage. At this baseline, future routes remained FAL-187. PR review,
merge and Jira completion are separate delivery steps.
