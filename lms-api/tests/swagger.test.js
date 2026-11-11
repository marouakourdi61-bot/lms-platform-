const fs = require("fs");
const path = require("path");
const request = require("supertest");
const SwaggerParser = require("@apidevtools/swagger-parser");
const app = require("../app");
const spec = require("../docs/swagger");
const { createQuizSchema, updateQuizSchema } = require("../validators/quizValidator");
const { submitQuizAttemptSchema } = require("../validators/quizAttemptValidator");
const { createFeedbackSchema, updateFeedbackSchema } = require("../validators/feedbackValidator");
const { createNotificationConfigSchema, updateNotificationConfigSchema } = require("../validators/notificationConfigValidator");
const { updateTrainerSummaryPreferenceSchema } = require("../validators/trainerSummaryPreferenceValidator");

const normalize = route => route.replace(/:[^/]+|\{[^}]+\}/g, "{}").replace(/\/$/, "") || "/";

describe("Current-route OpenAPI documentation", () => {
  test("is valid OpenAPI with no unresolved references", async () => {
    await expect(SwaggerParser.validate(JSON.parse(JSON.stringify(spec))))
      .resolves.toHaveProperty("openapi", "3.0.0");
  });

  test("covers every mounted application operation, including aliases", () => {
    const documented = new Set();
    for (const [route, operations] of Object.entries(spec.paths)) {
      for (const method of Object.keys(operations)) {
        if (["get", "post", "put", "patch", "delete"].includes(method)) {
          documented.add(`${method} ${normalize(route)}`);
        }
      }
    }

    const source = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
    const imports = new Map([...source.matchAll(/const (\w+) = require\("(\.\/routes\/[^"]+)"\)/g)]
      .map(match => [match[1], match[2]]));
    const mounted = new Set();
    for (const match of source.matchAll(/app\.use\("([^"]+)",\s*(\w+)\)/g)) {
      if (!imports.has(match[2])) continue;
      const router = require(path.join(__dirname, "..", imports.get(match[2])));
      for (const layer of router.stack) {
        if (!layer.route) continue;
        for (const method of Object.keys(layer.route.methods)) {
          mounted.add(`${method} ${normalize(match[1] + layer.route.path)}`);
        }
      }
    }
    for (const match of source.matchAll(/app\.(get|post|put|patch|delete)\("([^"]+)"/g)) {
      mounted.add(`${match[1]} ${normalize(match[2])}`);
    }

    // Compare both ways: no undocumented routes and no invented endpoints.
    expect([...documented].sort()).toEqual([...mounted].sort());
  });

  test.each([
    ["/api/quizzes", "post", createQuizSchema],
    ["/api/quizzes/{quizId}", "patch", updateQuizSchema],
    ["/api/quizzes/{quizId}/attempts", "post", submitQuizAttemptSchema],
    ["/api/feedback", "post", createFeedbackSchema],
    ["/api/feedback/{feedbackId}", "patch", updateFeedbackSchema],
    ["/api/config/notifications", "post", createNotificationConfigSchema],
    ["/api/config/notifications", "patch", updateNotificationConfigSchema],
    ["/api/trainer/summary-preferences", "patch", updateTrainerSummaryPreferenceSchema],
  ])("%s %s request example passes the real validator", (route, method, validator) => {
    const example = spec.paths[route][method].requestBody.content["application/json"].example;
    expect(example).toBeDefined();
    expect(validator.safeParse(example).success).toBe(true);
  });

  test.each([
    "/api/quizzes/507f1f77bcf86cd799439011",
    "/api/quizzes/507f1f77bcf86cd799439011/attempts",
    "/api/feedback/507f1f77bcf86cd799439011",
    "/api/config/notifications",
    "/api/trainer/summary-preferences",
  ])("documents the actual anonymous error for %s", async route => {
    const response = await request(app).get(route);
    expect(response.statusCode).toBe(401);
    const documentedPath = Object.keys(spec.paths).find(candidate =>
      normalize(candidate) === normalize(route.replace(/507f1f77bcf86cd799439011/g, "{}")));
    const example = spec.paths[documentedPath].get.responses[401].content["application/json"].example;
    expect(response.body).toEqual(example);
  });

  test.each(["/api/jobs/stats/run", "/api/admin/jobs/stats/run"])("documents authentication on job alias %s", async route => {
    const response = await request(app).post(route);
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(spec.paths[route].post.responses[401].content["application/json"].example);
  });

  test.each(["/", "/api/modules/test"])("public response example matches %s", async route => {
    const response = await request(app).get(route);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(spec.paths[route].get.responses[200].content["application/json"].example);
  });

  test("serves Swagger UI", async () => {
    const response = await request(app).get("/api-docs/");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("swagger-ui");
  });
});
