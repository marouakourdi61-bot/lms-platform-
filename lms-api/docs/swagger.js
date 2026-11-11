const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const schemas = require("./openapiSchemas");

const options = {
    failOnErrors: true,
    definition: {
        openapi: "3.0.0",
        info: {
            title: "LMS API",
            version: "1.0.0",
            description: "Current mounted LMS API routes. Bearer authentication and role rules are described per operation. Response envelopes differ by endpoint; use the documented schemas. Swagger UI is available at /api-docs."
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ],
        components: {
            schemas,
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: [
        path.join(__dirname, "../routes/*.js").replace(/\\/g, "/"),
        path.join(__dirname, "../app.js").replace(/\\/g, "/"),
    ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
