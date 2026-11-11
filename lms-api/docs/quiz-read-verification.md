# FAL-42 — Learner quiz read verification

Verified locally on 23 October 2026 (Africa/Casablanca).

## Implemented contract

`GET /api/quizzes/:quizId` requires a learner token and active enrollment in
the quiz's course. The course and module must be published, the quiz active,
and the published module at order minus one completed if it exists. This
matches the existing module progression rule. Completed/cancelled enrollments
are currently rejected, following the existing active-enrollment access policy.

The response contains status, message and data. Quiz data explicitly includes
only `_id`, `moduleId`, `title`, `passingScore`, `isRequired`, `isActive` and
`questions`. Questions contain only `id`, `text` and `choices`; choices contain
only `id` and `text`. Correct answers remain in MongoDB for backend scoring.
Trainer POST/PATCH routes remain separate from this learner-only GET.

## Evidence

- Quiz suite: **32 tests passed**, including 12 learner-read cases.
- Full suite: **98 tests passed across 7 suites**, exit code 0, 22.374 seconds.
- Syntax and whitespace checks passed.
- Tests use real HTTP requests through Supertest and local MongoDB `lms_test`.
- Checks cover safe response fields, retained database answers, anonymous and
  trainer rejection, missing/cancelled/completed enrollment, unpublished
  course/module, inactive quiz, sequential unlocking, and missing/invalid IDs.

```powershell
$env:MONGO_TEST_URI = 'mongodb://127.0.0.1:27017/lms_test'
npm test -- --runTestsByPath tests/quiz.test.js
npm test
```

The existing environment supplies `JWT_SECRET`. Tests clean up their own data;
no application database reset is used.

## FAL-42 attempt privacy verification — 27 October 2026

The October 23 check covered quiz reading only. Chahd's attempt implementation
is now integrated into team main through PR #48. The remaining privacy checks
are implemented in `tests/quizAttempt.test.js` using real HTTP requests through
Supertest, real login tokens, and the isolated `lms_test` database.

- Successful and failed submissions return scores and the learner's submitted
  choices, without `correctChoiceId`, private quiz questions, or a populated quiz.
- Explicit response-field allowlists reject unexpected fields on attempts and
  their answers, in both submission responses and history responses.
- Two real enrolled learners submit different choices to the same quiz. Each
  receives only their own attempt in history, including when query parameters
  contain the other learner's ID.
- Anonymous submission and history requests return 401 with no attempt data;
  anonymous submission creates no record.
- MongoDB retains `correctChoiceId` on the quiz for backend scoring. Submitted
  attempts are persisted, and tests clean up their own records.

Focused result: **14 attempt tests passed**, including five new privacy cases.
Full regression result: **204 tests passed across 17 suites**, exit code 0.

```powershell
npm test -- --runTestsByPath tests/quizAttempt.test.js
```

These results verify local behavior. Review, commit, PR merge, Jira completion,
and team acceptance remain separate. Docker/container checks were not performed.
