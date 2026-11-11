# FAL-173 — Quiz creation and modification verification

Verified on 23 October 2026 (Africa/Casablanca), against commit `8437321`
plus `tests/quiz.test.js` in the working tree.

## Results

- Quiz integration suite: **20/20 tests passed**, exit code 0.
- Full regression suite: **82/82 tests passed across 6 suites**, exit code 0.
- Full run duration: 13.512 seconds.
- Whitespace check passed.

Tests use the real Express app, middleware, controllers, Mongoose models and
MongoDB database `lms_test`. Successful writes are read back from MongoDB.
Rejected modifications are checked against the saved document to prove it
remains unchanged. Fixtures use uniquely named test accounts; cleanup removes
only their associated records, including quizzes before modules are removed.

## Reproduce

Local MongoDB must be running and the existing environment must supply
`JWT_SECRET`. Do not put its value in this document or in Git.

```powershell
$env:MONGO_TEST_URI = 'mongodb://127.0.0.1:27017/lms_test'
npm test -- --runTestsByPath tests/quiz.test.js
npm test
```

Port 27018 was unavailable during this verification. Port 27017 was reachable;
only a process-local test URI override was used, without editing `.env`.

## Covered scenarios

| Operation | Scenario | Expected result |
| --- | --- | --- |
| POST `/api/quizzes` | Owner creates valid quiz | 201; module and questions persisted |
| POST | Anonymous, learner, another trainer | 401/403; no quiz inserted |
| POST | Invalid score, duplicate question IDs, unknown correct choice, missing title | 400; no quiz inserted |
| POST | Missing module | 404 |
| PATCH `/api/quizzes/:quizId` | Owner edits title, score, flags | 200; changes persisted, including zero/false |
| PATCH | Omitted fields and module association | Preserved |
| PATCH | Owner replaces valid questions | 200; new answers persisted |
| PATCH | Anonymous, learner, another trainer | 401/403; document unchanged |
| PATCH | Invalid score, empty body, module reassignment, empty questions, blank title | 400; document unchanged |
| PATCH | Missing quiz | 404 |

Trainer requests use short-lived JWTs signed with the configured test secret.
The other-trainer case uses a distinct subject claim rather than an extra
persisted user, matching the current authentication middleware's claim-based
behavior. Learner authentication goes through the existing login fixture.

## Boundaries

This verifies FAL-173's creation/modification scenarios. It does not verify
learner quiz reads, answer filtering (FAL-42), attempts/scoring, duplicate-quiz
policy, or Docker deployment. No Postman collection was exported by this task.
The executable evidence is the Jest/Supertest suite. Jira status, PR review,
merge and team acceptance are separate delivery steps; none was changed here.
