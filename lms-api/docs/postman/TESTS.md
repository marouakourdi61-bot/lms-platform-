# 🧪 FAL-163 collection verification

> **Latest result: 30 October 2026 — 90 requests, 209 assertions, zero failures, zero skips.** This is isolated local Postman/Newman verification. Second-developer replay and reviewed delivery remain pending.

## Final isolated run — 30 October 2026

Executed the exported collection through Newman against the actual local Express application at source commit `527ca48`. The API ran at `http://127.0.0.1:3001`, connected exclusively to temporary MongoDB on port `27019`, database `lms_postman_20261030`. Docker was stopped. The working database and seed were not changed. Temporary users, passwords and JWT signing secret were created only for this run; they were never exported.

Database setup used the existing Mongoose models to create five users and an unrelated course/module for refusal checks. All HTTP journeys below ran through **Newman executing the Postman requests**, including login and linked fixture creation. This is not a manual Postman desktop replay or a browser integration test. Two additional identity-setup logins had their HTTP 200 and token checked by the runner; they add two requests but no `pm.test` assertions.

| Phase | Requests | Assertions | Result |
| --- | ---: | ---: | --- |
| Public smoke | 4 | 11 | Passed |
| Learner, trainer and admin login | 3 | 9 | Passed |
| Distinct other learner/trainer login | 2 | 0 | HTTP 200 and tokens observed |
| Disposable course/module/resource/quiz, publish and enrollment | 6 | 17 | Passed |
| Create trainer feedback | 1 | 3 | Passed |
| Ten frontend reading journeys | 10 | 23 | Passed |
| Access/validation cases, including missing upload | 14 | 42 | Passed |
| Resource consultation, quiz attempt, module completion, progress/resume, feedback update and attempt history | 7 | 14 | Passed |
| Config lifecycle, eight job aliases, history, statistics and trainer preferences | 17 | 33 | Passed |
| PDF upload, unsupported type, file above 5 MiB | 3 | 9 | 201 / 400 / 413 |
| Remaining auth, trainer reads and entity updates | 11 | 23 | Passed |
| Used resource/course deletion guards | 2 | 2 | Expected 409 |
| Other learner enrollment and enabled inactive reminder | 4 | 8 | Passed; one reminder logged |
| Fresh unused course/module/resource for deletion | 3 | 9 | Passed |
| Unused resource/module/course deletion | 3 | 6 | Expected 200 |
| **Total** | **90** | **209** | **0 failures; 0 skips** |

The sanitized [execution report](verification-2026-10-30.json) records each request name and observed status without request bodies, response bodies, credentials or tokens. The 90 executions include repeated requests with different prerequisites; they are not 90 unique endpoints and do not mean every possible branch has been tested.

### Fixture order matters

An initial setup run missed `JWT_EXPIRES_IN`; setting it to `1h` fixed the temporary server configuration. No application fix was needed. An exploratory config POST returned 409 because enrollment had already created default configuration. The final lifecycle deliberately deletes that isolated configuration before expecting POST 201. Similarly, deleting a consulted resource or enrolled course returns 409; successful deletion uses a separate unused fixture. These earlier failures are not counted as passing runs; the table describes the final corrected replay only.

For a manual replay in a disposable environment:

1. Set the base URL, local credentials and `allowWrites=true`. Run public smoke and the three role logins.
2. Run folder `05` once. Create feedback using the API reference and save `data._id` as `feedbackId`. Prepare distinct other-user tokens and a module in another course.
3. Run the ten frontend reads and sixteen refusal/validation cases. Supply a genuine allowed PDF, unsupported text file and PDF larger than 5 MiB for the upload cases.
4. Consult the resource, submit `q1=a`, complete the module, then read progress/resume and attempt history. Update feedback. Test refusal cases before modifying/deleting their fixture.
5. Exercise config CRUD with explicit singleton state, the eight job routes, job history, trainer statistics/preferences and entity updates. For an actual inactive email, enable that job and enroll a distinct learner with no recent activity. Disable jobs afterward.
6. Use a new unused course/module/resource for successful DELETE requests. Do not expect a used course/resource to be deletable. Set `allowWrites=false`, clear local secrets before exporting, and record the results.

### Email and delivery boundaries

Observed actual log-driver events: `user_registered`, `course_enrolled`, `trainer_summary`, `inactive_learner_reminder`. The enabled reminder job logged one sent message. These observations prove log output, not SMTP delivery or receipt.

**Source correction and backend gap:** the supplied brief section 4 requires registration, enrollment, forgotten password (token or simulated link), inactive reminder and trainer summary. Earlier advice incorrectly named quiz-completion email; it is not one of these five requirements. Current mounted auth routes are register/login/me, with no forgot/reset journey. Four required log events were observed, so the forgotten-password situation remains unverified and has no mounted implementation in this revision. This collection documents the current API rather than inventing an email route or changing backend behavior.

Cron timing, SMTP/sandbox delivery, deployed Docker replay, frontend browser integration, second-developer import, review and merge are outside this run. The locally imported collection and environment remain secret-free, with `allowWrites=false` and default port 3000 for the normal Docker handoff. Temporary API/database processes and files were removed after verification. No commit or push was made.

## Historical preparation and smoke run — 29 October 2026

## Baseline

- Date: 29 October 2026, Africa/Casablanca.
- Source baseline: local LMS `main`, commit `527ca48`.
- Inputs: learner-supplied `lms.postman_collection.json`, current integrated OpenAPI, React API contract revision 0.4, saved Brief 3 source and browser-verified FAL-163 acceptance criteria.
- Original export: 67 saved requests, 17 `pm.test()` calls, no request descriptions or saved response examples. Export inspection does not establish historical execution success.

## Changes reviewed

- Preserved the original Downloads export and Postman collection.
- Rebuilt the endpoint reference from current source rather than carrying fixed database IDs and blank URLs into the handoff.
- Replaced mixed collection/environment ID writes with environment-only variables, role-specific token capture and explicit linked fixtures.
- Corrected negative-scenario intent: an unenrolled learner quiz read expects 403; wrong-course feedback is a POST with a mismatching existing module, not a GET of feedback.
- Added admin configuration/history operations from the real `/api/config` mount, not the empty source placeholders.
- Retained upload limit and refused-access scenarios with explicit preparation. Generic copy names and empty Email/Admin placeholders are not runnable evidence and were removed.
- Source email placeholder is represented by documented business triggers and observability, not a fabricated email endpoint.
- Preserved API response differences and documented backend gaps; no backend behavior was changed.

## Verification status

The table below is the historical 29 October snapshot. The final isolated run above supersedes its pending local-execution rows; external delivery boundaries still apply.

| Check | Status |
| --- | --- |
| JSON exports parse | ✅ Collection and environment parse; Newman imports both |
| Reference covers all mounted OpenAPI operations | ✅ Exact 54-operation method/path match with current OpenAPI; 93 requests total including journeys, scenarios and fixture setup |
| Variable references and body examples | ✅ 389 request variable references resolve to exported variable names; 27 raw JSON bodies parse; all 17 reference JSON bodies pass their current Zod validators after local fixture substitution |
| Postman script syntax and prerequisite behavior | ✅ 186 scripts compile; six targeted guard checks pass for public access, missing credentials, login readiness, write opt-in and missing parent fixture |
| Public smoke against integrated API | ✅ Newman: 4 requests, 11 assertions, 0 failures, 0 skips; localhost:3000; no data-changing request executed |
| Authenticated role/access scenarios | ⬜ Unrun; local credentials/linked fixtures needed |
| Optional disposable fixture setup | ⬜ Unrun; creates records and can trigger notifications |
| Upload, config, job and email scenarios | ⬜ Unrun; manual files/configuration/observability needed |
| Second-developer import and frontend replay | ⬜ Pending |
| PR review and delivery on team main | ⬜ Pending |

### Observed smoke responses

| Request | Observed status | Assertions |
| --- | --- | --- |
| `GET /` | 200 | Expected status; JSON response |
| `GET /api/courses` | 200 | Expected status; JSON; numeric count, course array and published status |
| `GET /api/auth/me` without authorization | 401 | Expected status; JSON; readable error message |
| `GET /api/auth/me` with deliberately invalid token | 401 | Expected status; JSON; readable error message |

These results were produced by **Newman executing the exported Postman collection**, not by manual Send in the Postman UI. The source baseline above is a local Git reference; the running container's exact image/source revision was not compared in this smoke run. No claim is made that all authenticated behavior matches that source snapshot. No raw credential-bearing runner report was saved.

Reproduce with the command in [README.md](./README.md#command-line-smoke-check). No application dependency or package file was changed; Newman was loaded through the external npm tool cache.

## Record each later run

Record date/time, backend commit/image, base URL, folder, fixture setup, account role (no token), request/assertion totals, failures, skips and important observed responses. Do not store credential-bearing runner reports. A skipped request is not a passing scenario, and a complete collection export is not a completed test run.
