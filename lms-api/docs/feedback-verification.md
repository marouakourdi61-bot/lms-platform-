# FAL-153 feedback verification

Verification date: 2026-10-26. Branch: `FAL-153-trainer-feedback-access`.

## Results and evidence boundaries

- **28 passed, 0 failed**: real HTTP requests against the current `app.js`, listening on a temporary local port, with the real `lms` MongoDB database. No controllers, authorization, or database operations were mocked.
- Temporary JWTs were signed locally for existing active users. These checks do **not** verify login credentials, Postman execution, or the original extension variables. No tokens or credentials were saved to these artifacts.
- The already-running API on port 3000 separately returned the expected ownership 403 and wrong-course-module 400 using the two different trainer identities.
- The successful POST was checked directly in MongoDB: ID, trainer, learner, course, module, comment, and collection count. Rejected requests exposed no `data` or top-level feedback fields and did not increase the feedback count.
- Raw sanitized results and fixture IDs: [feedback-verification-results.json](feedback-verification-results.json).
- All 37 importable Postman requests are **prepared, unrun in Postman**. Five are logins; the collection also includes identity/course diagnostics and two enrollment policy cases.

The 28 API checks cover creation; owner/recipient/admin reads; unrelated learner/trainer reads; unrelated module; unenrolled existing learner; unauthorized creation; missing authentication for both endpoints; valid nonexistent course/module/feedback IDs; malformed IDs for all four identifiers; blank comment; unexpected trainer/extra fields; missing required body fields; learner/admin creation; invalid bearer token.

## Wrong-course module diagnosis

Authorization runs before the module relationship check. Do not change that order to force a 400.

Verified fixture mapping:

| Variable | Existing record ID |
| --- | --- |
| trainerId / selected course owner | `6adb4255f6a0c14e53004548` |
| courseId | `6adb83a133e45f5b7d9664d0` |
| moduleId belonging to courseId | `6adb83c733e45f5b7d9664d4` |
| learnerId with active enrollment | `6ad9f36f099d9eb7e76e1e68` |
| otherModuleId | `6acf7246dbc118977e2babee` |
| otherModuleId's actual course | `6acf72f60636619e9986eb73` |
| unrelated trainer used in reproduction | `6ace1bdbc468618a68f6310c` |

On the running API, the unrelated trainer role was `trainer`, but its JWT subject did not match the selected course owner: **403**, `You are not authorized to give feedback for this course`. With the owner's identity and the same unrelated module: **400**, `Module does not belong to this course`.

`Forbidden` instead indicates that the role middleware rejected the token's role. A missing, invalid, or expired token produces 401. These are different failures.

The original Postman request's exact response, resolved token, selected environment, and resolved IDs were inaccessible. The VS Code cached collection session found during inspection contained empty values and did not include all reported variables; it cannot establish the original request's active scope. No local collection/environment export was found. Do not treat the reproduced case as proof of the original variable mismatch.

## Import and run without replacing your work

1. Import [FAL-153-feedback.postman_collection.json](FAL-153-feedback.postman_collection.json) as a **separate collection**. It contains the folder `Feedback — FAL-153` with numbered requests. Original extension requests and variables were not edited.
2. To use your existing folder instead, back it up, merge the missing variables locally, and copy the prepared requests and folder pre-request script deliberately. Do not replace the original collection or discard existing scripts.
3. The supplied non-secret IDs are the verified fixtures above, not claims about your original variable values. Use credentials for those existing identities in the matching prefixed login variables. All exported password/email/token values are empty. Never export a populated collection/environment or share a login response.
4. Run the five login requests. Each checks role and the configured identity before saving `data.token` and `data.user.id` into its own prefixed collection variables. Other-user logins never update `trainerId`, `trainerToken`, `learnerId`, or `learnerToken`.
5. Run the owner identity and course owner diagnostics, then the numbered feedback cases. Course lookup uses the public published-course endpoint; drafts must be verified directly in MongoDB. The supplied course was checked against MongoDB.
6. The folder pre-request script refuses empty variables or effective values different from collection values. Check selected environment, globals, local variables, and runner data when it reports a conflicting variable name. It never prints values. Do not disable the guard to work around a token or ID mismatch.
7. Successful creation stores `feedbackId` and appends to `fal153CreatedFeedbackIds`. This creates real feedback records. Record those IDs; no cleanup DELETE requests are included.
8. Missing-record IDs were generated and verified absent from their corresponding MongoDB collections during preparation. They are valid ObjectIds. The malformed-ID requests deliberately use `not-an-object-id` instead.

All requests specify their method, URL, authorization, applicable JSON body, and post-response assertions. Rejection assertions check the expected status/message and absence of feedback data. Postman success assertions check returned associations; direct database persistence was separately verified by the real HTTP run.

## Enrollment policy

The user confirmed the desired policy: **active and completed only**, then instructed that application code must remain untouched. The temporary enrollment status filter was reverted. The current controller accepts any existing enrollment, including cancelled. Enforcing the desired policy remains pending; the prepared cancelled-rejection request describes the desired behavior and may fail against the current code.

There were two active enrollments and **no completed or cancelled enrollments** in the inspected database. The completed-success and cancelled-rejection requests therefore remain **unrun**. Set `completedLearnerId` or `cancelledLearnerId` only to an existing learner with that enrollment status for `courseId`. These requests skip while those variables are empty. No accounts or enrollment records were created, updated, or deleted to manufacture fixtures.

## Records created

This verification created and retained exactly one feedback record:

`6adf87e6748b6947482980e8`

Its comment starts with `FAL-153 verification`. Feedback count changed from 3 to 4. Existing accounts, courses, modules, enrollments, and feedback records were preserved.
