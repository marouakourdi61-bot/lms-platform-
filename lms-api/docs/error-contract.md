# API Error Contract

Status: Draft for backend team review. This document defines the proposed error format; it does not confirm that every endpoint implements it yet.

Local API test results and reproduction steps are recorded in [FAL-179 verification](error-contract-verification.md). React integration and team approval remain pending.

## Response fields

| Field | Type | Required | Purpose |
| --- | --- | --- | --- |
| `status` | Number | Yes | HTTP status code, matching the response's HTTP status. |
| `message` | String | Yes | A readable explanation of the error. |
| `errors` | Array of objects | For validation failures | Details for invalid fields. Each object contains a `field` string and a `message` string. Omit this property for other errors. |

## HTTP error statuses

The following table defines the proposed behavior. Example messages describe the case; validation details belong in `errors` when applicable.

| HTTP status | When to use it | Example message |
| --- | --- | --- |
| `400 Bad Request` | The request contains invalid input, an invalid ID format, or malformed JSON. | `Validation error`, `Invalid ID`, or `Invalid JSON` |
| `401 Unauthorized` | Authentication is missing or invalid: absent, invalid, or expired token, or incorrect login credentials. | `Authentication required`, `Invalid token`, or `Invalid credentials` |
| `403 Forbidden` | The user is authenticated but their role, account state, ownership, or enrollment does not allow the action. | `Forbidden` |
| `404 Not Found` | The requested route does not exist, or a resource with a valid ID cannot be found. | `Route not found` or `Course not found` |
| `409 Conflict` | The request conflicts with existing data, such as an email already registered or a duplicate enrollment. | `Email already registered` or `Already enrolled` |
| `413 Content Too Large` | An uploaded file exceeds the configured size limit. | `File must not exceed 5 MB` |
| `500 Internal Server Error` | An unexpected server failure prevents the request from completing. Return a generic message and keep technical details in server logs. | `Internal server error` |

An incorrectly formatted ID returns `400`; a correctly formatted ID pointing to a missing resource returns `404`. Missing authentication returns `401`; insufficient permission after authentication returns `403`.

Implemented in FAL-178: Mongoose validation details use the same array format as Zod, malformed JSON receives an explicit response, and unexpected server errors use the generic message above. Direct controller errors include `status`; the error handler accepts both `error.statusCode` and `error.status`. Focused isolated checks do not replace database-backed endpoint verification in FAL-179. Backend team review is still pending.

## Invalid email example

An invalid email format returns HTTP `400 Bad Request` because the submitted input is invalid. HTTP `401` is used for authentication failures.

```json
{
  "status": 400,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

This is a contract example. Individual validation messages depend on the validator rules.

## Forbidden access example

An authenticated learner attempting an action restricted to trainers receives HTTP `403 Forbidden`. This is a permission error, so the response omits the validation-only `errors` property.

```json
{
  "status": 403,
  "message": "Forbidden"
}
```

## Unexpected server error example

An unexpected server failure returns HTTP `500 Internal Server Error`. The response uses a generic message and omits `errors`; technical details belong in server logs, never in the response.

```json
{
  "status": 500,
  "message": "Internal server error"
}
```

The `500` example is implemented in the error handler; full endpoint verification remains part of FAL-179.
