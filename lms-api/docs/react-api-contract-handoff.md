# FAL-190 - React API contract review and handoff

Review date: 29 October 2026 (Africa/Casablanca).

The [React API contract](react-api-contract.md) revision 0.4 is ready for
documentation review. Its examples describe the current backend and clearly
separate source inspection, automated behavior checks and demo replay.
Backend/frontend approval and delivery to team main remain pending.

## Revisions compared

| Reference | Revision / result |
| --- | --- |
| Working branch | `FAL-161-b-3-contrat-livrer-un-contrat-api-stable-avec-exemples-pour-react` |
| Local HEAD | `c7289dd`; contract changes remain uncommitted |
| Integrated backend baseline | `de43520` |
| Team main checked remotely and fetched | `384eb7674e551ddb656784a52b7e078c4c174281` |
| Change from baseline to team main | Only `docker-compose.yml`: forwards `SEED_DEMO_PASSWORD` to the API container |
| API comparison | No differences in mounted routes, controllers, services, models, validators, middleware, seed or OpenAPI sources |

The comparison does not merge team main into this branch. The newer Docker
configuration is relevant when preparing demo accounts inside a container.
The seed reads its password from the environment, not from this document.

## Consistency findings

| Area | Checked evidence and result |
| --- | --- |
| Paths and methods | Contract references checked against generated OpenAPI; the existing Swagger suite checks mounted operations in both directions, including aliases. |
| Authentication | `app.js`, auth routes/controller, auth validator and JWT middleware confirm `/api/auth`, Bearer tokens, `data.token`, public learner registration and suspended-account login refusal. |
| Payload fields | Selected cards checked against their controllers/services and models: auth, catalogue, enrollment, quizzes/attempts, feedback, trainer statistics and progression. Different response envelopes are retained. |
| Status codes | Corrected card 4.8's missing numeric `status: 404`; service errors pass through the central error handler. Existing error responses may otherwise use different envelopes as documented. |
| Role and ownership rules | Learner quiz reading/submission, trainer statistics, recipient/owner/admin feedback and enrollment-based progression match route middleware and service/controller checks. Admin is not a universal bypass. |
| Scope index | Added the selected progression, quiz, feedback and statistics journeys so readers can find the cards already present. |
| Seed account references | Admin/trainer/learner emails and environment-supplied password match `seed/seed.js`. The seed can replace matching course records and reset demo passwords; it was not executed. |
| Seed progress | First course has two published modules and two resources; one module completed and one resource consulted explain its 50% initial progress. |
| Quiz example difference | The illustrative single-question result is not the seed's three-question quiz. The contract now states why a one-answer seed submission does not return 100%. |
| Feedback and statistics setup | Seed creates neither feedback nor a successful statistics-refresh execution. IDs/records must be prepared deliberately; no-data statistics are a valid success. |

## Verification

Executed against the current local application sources on 29 October 2026:

- Full existing suite: **230 tests passed across 20 suites**, exit code 0.
- Earlier focused runs in this session: Swagger **20 passed**, progression
  **13 passed**; these are included in the full suite, not additional tests.
- All eight fenced JSON examples parse. Login, attempt-submission and feedback
  update request examples pass their current Zod validators.
- All 64 contract method/path references match generated OpenAPI after
  normalizing parameter names (54 operations across 40 paths). All 19 local
  links/internal anchors across the contract and this handoff pass; the
  browser-example JavaScript syntax is valid.
- Whitespace checks passed for the documentation changes.

The existing tests use `lms_test`. They exercise behavior with test fixtures;
they do not establish that the fictitious IDs in the document exist, that
the seed was replayed, or that a browser React application can connect.
No new automated test file or endpoint implementation is part of this task.

Reproduce with dependencies installed, MongoDB running, and the existing local
environment providing `MONGO_TEST_URI` and `JWT_SECRET`:

```powershell
npm test
git diff --check -- docs/react-api-contract.md docs/react-api-contract-handoff.md README.md
```

Related evidence, with its original dates and limits:

- [OpenAPI coverage and validation](openapi-verification.md)
- [Error contract verification](error-contract-verification.md)
- [Learner quiz and attempt privacy verification](quiz-read-verification.md)
- [Feedback verification](feedback-verification.md)

## Remaining decisions and delivery

| Item | Required follow-up |
| --- | --- |
| Browser connection | Agree a same-origin/proxy setup or separately scoped CORS support; none is configured in `app.js`. |
| UI behavior | Agree token storage, endpoint-specific response handling, empty states and statistics snapshot age. |
| Existing backend gaps | Quiz submission has fewer access prerequisites than reading; resource listing is public and some content writes lack ownership checks. See the contract's decision register. |
| ID discovery | Agree how React obtains existing quiz/feedback IDs; no corresponding list/lookup endpoints are mounted. |
| Demo replay | Prepare the intended environment, obtain current IDs, replay selected journeys and record actual responses separately from illustrative examples. No seed reset is assumed. |
| Collection | Importable collection/environment delivery remains FAL-163. |
| Scope approval | Confirm selected screens and any additional trainer CRUD cards with backend/frontend reviewers. |
| Review and merge | Commit/push when authorized, open/link the PR, obtain review and merge to team main through the normal workflow. |

FAL-190's local consistency review and handoff preparation are complete.
Parent FAL-161 is not delivered until its required versioning, review and merge
are confirmed. No team agreement, PR or merge is claimed here. Jira statuses
were not changed by this documentation work.

## Prepared review description

Title: `docs(FAL-161): prepare the React API contract and verification handoff`

The React frontend needs explicit request, response, error and access rules
for the selected LMS journeys. This documents those rules, demo prerequisites
and known backend limitations, adds a progression card, and records comparison
with team main `384eb76` and current OpenAPI.

Validation: 230 existing tests passed across 20 suites; JSON examples, request
validators, method/path references, document links and whitespace checked.
Examples remain illustrative until environment-specific replay. Team approval
and merge are pending. PR link: not yet available.
