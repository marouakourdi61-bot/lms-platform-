// Shared schemas for route annotations. Match current validators and serialized responses.
module.exports = {
  "ObjectId": {
    "type": "string",
    "pattern": "^[a-fA-F0-9]{24}$",
    "example": "507f1f77bcf86cd799439011"
  },
  "ApiError": {
    "type": "object",
    "properties": {
      "status": {
        "type": "integer",
        "example": 400
      },
      "message": {
        "type": "string"
      },
      "errors": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "field": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "field",
            "message"
          ]
        }
      }
    },
    "required": [
      "status",
      "message"
    ]
  },
  "MessageError": {
    "type": "object",
    "properties": {
      "message": {
        "type": "string"
      }
    },
    "required": [
      "message"
    ]
  },
  "Choice": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      },
      "text": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      }
    },
    "required": [
      "id",
      "text"
    ],
    "additionalProperties": false
  },
  "PublicQuestion": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      },
      "text": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      },
      "choices": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Choice"
        },
        "minItems": 2
      }
    },
    "required": [
      "id",
      "text",
      "choices"
    ],
    "additionalProperties": false
  },
  "PrivateQuestion": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      },
      "text": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      },
      "choices": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Choice"
        },
        "minItems": 2
      },
      "correctChoiceId": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      }
    },
    "required": [
      "id",
      "text",
      "choices",
      "correctChoiceId"
    ],
    "additionalProperties": false,
    "description": "Trainer input/response only. Choice IDs must be unique; correctChoiceId must match a choice ID."
  },
  "QuizCreate": {
    "type": "object",
    "properties": {
      "moduleId": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "title": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      },
      "passingScore": {
        "type": "number",
        "minimum": 0,
        "maximum": 100
      },
      "isActive": {
        "type": "boolean"
      },
      "isRequired": {
        "type": "boolean"
      },
      "questions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/PrivateQuestion"
        },
        "minItems": 1
      }
    },
    "required": [
      "moduleId",
      "title",
      "passingScore",
      "questions"
    ],
    "additionalProperties": false,
    "description": "One quiz per module. Question IDs must be unique across the quiz."
  },
  "QuizUpdate": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      },
      "passingScore": {
        "type": "number",
        "minimum": 0,
        "maximum": 100
      },
      "isActive": {
        "type": "boolean"
      },
      "isRequired": {
        "type": "boolean"
      },
      "questions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/PrivateQuestion"
        },
        "minItems": 1
      }
    },
    "additionalProperties": false,
    "minProperties": 1,
    "description": "At least one field. moduleId cannot change. Question IDs must be unique."
  },
  "PrivateQuiz": {
    "type": "object",
    "properties": {
      "_id": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "moduleId": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "title": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      },
      "passingScore": {
        "type": "number",
        "minimum": 0,
        "maximum": 100
      },
      "isActive": {
        "type": "boolean"
      },
      "isRequired": {
        "type": "boolean"
      },
      "questions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/PrivateQuestion"
        }
      },
      "createdAt": {
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time"
      },
      "__v": {
        "type": "integer"
      }
    },
    "required": [
      "_id",
      "moduleId",
      "title",
      "passingScore",
      "questions"
    ]
  },
  "PublicQuiz": {
    "type": "object",
    "properties": {
      "_id": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "moduleId": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "title": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      },
      "passingScore": {
        "type": "number",
        "minimum": 0,
        "maximum": 100
      },
      "isActive": {
        "type": "boolean"
      },
      "isRequired": {
        "type": "boolean"
      },
      "questions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/PublicQuestion"
        }
      }
    },
    "required": [
      "_id",
      "moduleId",
      "title",
      "passingScore",
      "isActive",
      "isRequired",
      "questions"
    ],
    "additionalProperties": false,
    "description": "Learner response: contains no correctChoiceId or private question fields."
  },
  "AnswerInput": {
    "type": "object",
    "properties": {
      "questionId": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      },
      "choiceId": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      }
    },
    "required": [
      "questionId",
      "choiceId"
    ],
    "additionalProperties": false
  },
  "AttemptInput": {
    "type": "object",
    "properties": {
      "answers": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/AnswerInput"
        }
      }
    },
    "required": [
      "answers"
    ],
    "additionalProperties": false,
    "description": "Only answers are accepted. The backend calculates the score. An empty array is accepted and scores zero; omitted questions are incorrect."
  },
  "Attempt": {
    "type": "object",
    "properties": {
      "_id": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "learner": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "quiz": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "answers": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "_id": {
              "$ref": "#/components/schemas/ObjectId"
            },
            "questionId": {
              "type": "string"
            },
            "choiceId": {
              "type": "string"
            }
          },
          "required": [
            "questionId",
            "choiceId"
          ]
        }
      },
      "correctCount": {
        "type": "integer",
        "minimum": 0
      },
      "totalQuestions": {
        "type": "integer",
        "minimum": 1
      },
      "scorePercent": {
        "type": "number",
        "minimum": 0,
        "maximum": 100
      },
      "passed": {
        "type": "boolean"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time"
      },
      "__v": {
        "type": "integer"
      }
    },
    "required": [
      "_id",
      "learner",
      "quiz",
      "answers",
      "correctCount",
      "totalQuestions",
      "scorePercent",
      "passed"
    ],
    "additionalProperties": false,
    "description": "Submitted choices and backend score only; quiz is an ID, not a populated private quiz."
  },
  "FeedbackCreate": {
    "type": "object",
    "properties": {
      "learner": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "course": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "module": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "comment": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      }
    },
    "required": [
      "learner",
      "course",
      "module",
      "comment"
    ],
    "additionalProperties": false
  },
  "FeedbackUpdate": {
    "type": "object",
    "properties": {
      "comment": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      }
    },
    "required": [
      "comment"
    ],
    "additionalProperties": false
  },
  "Feedback": {
    "type": "object",
    "properties": {
      "_id": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "trainer": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "learner": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "course": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "module": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "comment": {
        "type": "string",
        "minLength": 1,
        "description": "Trimmed; whitespace-only values are rejected."
      },
      "createdAt": {
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time"
      },
      "__v": {
        "type": "integer"
      }
    },
    "required": [
      "_id",
      "trainer",
      "learner",
      "course",
      "module",
      "comment"
    ]
  },
  "ConfigCreate": {
    "type": "object",
    "properties": {
      "notifications": {
        "type": "object",
        "properties": {
          "enabled": {
            "type": "boolean"
          },
          "emailDriver": {
            "type": "string",
            "enum": [
              "log",
              "sandbox",
              "smtp"
            ],
            "description": "The validator accepts smtp, but the current sendEmail service implements log and sandbox only."
          }
        },
        "additionalProperties": false
      },
      "jobs": {
        "type": "object",
        "properties": {
          "inactiveLearnerReminder": {
            "type": "object",
            "properties": {
              "enabled": {
                "type": "boolean"
              },
              "frequency": {
                "type": "string",
                "example": "0 9 * * *",
                "description": "Valid five-field cron expression. Scheduler timezone: Africa/Casablanca."
              },
              "inactiveDays": {
                "type": "integer",
                "minimum": 1,
                "maximum": 365
              }
            },
            "required": [
              "enabled",
              "frequency"
            ],
            "additionalProperties": false
          },
          "trainerSummary": {
            "type": "object",
            "properties": {
              "enabled": {
                "type": "boolean"
              },
              "frequency": {
                "type": "string",
                "example": "0 9 * * *",
                "description": "Valid five-field cron expression. Scheduler timezone: Africa/Casablanca."
              }
            },
            "required": [
              "enabled",
              "frequency"
            ],
            "additionalProperties": false
          },
          "statsRefresh": {
            "type": "object",
            "properties": {
              "enabled": {
                "type": "boolean"
              },
              "frequency": {
                "type": "string",
                "example": "0 9 * * *",
                "description": "Valid five-field cron expression. Scheduler timezone: Africa/Casablanca."
              }
            },
            "required": [
              "enabled",
              "frequency"
            ],
            "additionalProperties": false
          }
        },
        "additionalProperties": false
      }
    },
    "additionalProperties": false,
    "description": "Creates the singleton global config. Empty body {} is accepted and uses model defaults."
  },
  "ConfigUpdate": {
    "type": "object",
    "properties": {
      "notifications": {
        "type": "object",
        "properties": {
          "enabled": {
            "type": "boolean"
          },
          "emailDriver": {
            "type": "string",
            "enum": [
              "log",
              "sandbox",
              "smtp"
            ],
            "description": "The validator accepts smtp, but the current sendEmail service implements log and sandbox only."
          }
        },
        "additionalProperties": false
      },
      "jobs": {
        "type": "object",
        "properties": {
          "inactiveLearnerReminder": {
            "type": "object",
            "properties": {
              "enabled": {
                "type": "boolean"
              },
              "frequency": {
                "type": "string",
                "example": "0 9 * * *",
                "description": "Valid five-field cron expression. Scheduler timezone: Africa/Casablanca."
              },
              "inactiveDays": {
                "type": "integer",
                "minimum": 1,
                "maximum": 365
              }
            },
            "additionalProperties": false,
            "minProperties": 1
          },
          "trainerSummary": {
            "type": "object",
            "properties": {
              "enabled": {
                "type": "boolean"
              },
              "frequency": {
                "type": "string",
                "example": "0 9 * * *",
                "description": "Valid five-field cron expression. Scheduler timezone: Africa/Casablanca."
              }
            },
            "additionalProperties": false,
            "minProperties": 1
          },
          "statsRefresh": {
            "type": "object",
            "properties": {
              "enabled": {
                "type": "boolean"
              },
              "frequency": {
                "type": "string",
                "example": "0 9 * * *",
                "description": "Valid five-field cron expression. Scheduler timezone: Africa/Casablanca."
              }
            },
            "additionalProperties": false,
            "minProperties": 1
          }
        },
        "additionalProperties": false
      }
    },
    "additionalProperties": false,
    "minProperties": 1,
    "description": "At least notifications or jobs must be provided. Each supplied job must have at least one setting. Nested empty notifications/jobs objects are currently accepted."
  },
  "NotificationConfig": {
    "type": "object",
    "properties": {
      "_id": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "key": {
        "type": "string",
        "enum": [
          "global"
        ]
      },
      "notifications": {
        "type": "object",
        "properties": {
          "enabled": {
            "type": "boolean"
          },
          "emailDriver": {
            "type": "string",
            "enum": [
              "log",
              "sandbox",
              "smtp"
            ],
            "description": "The validator accepts smtp, but the current sendEmail service implements log and sandbox only."
          }
        },
        "additionalProperties": false
      },
      "jobs": {
        "type": "object",
        "properties": {
          "inactiveLearnerReminder": {
            "type": "object",
            "properties": {
              "enabled": {
                "type": "boolean"
              },
              "frequency": {
                "type": "string",
                "example": "0 9 * * *",
                "description": "Valid five-field cron expression. Scheduler timezone: Africa/Casablanca."
              },
              "inactiveDays": {
                "type": "integer",
                "minimum": 1,
                "maximum": 365
              }
            },
            "required": [
              "enabled",
              "frequency"
            ],
            "additionalProperties": false
          },
          "trainerSummary": {
            "type": "object",
            "properties": {
              "enabled": {
                "type": "boolean"
              },
              "frequency": {
                "type": "string",
                "example": "0 9 * * *",
                "description": "Valid five-field cron expression. Scheduler timezone: Africa/Casablanca."
              }
            },
            "required": [
              "enabled",
              "frequency"
            ],
            "additionalProperties": false
          },
          "statsRefresh": {
            "type": "object",
            "properties": {
              "enabled": {
                "type": "boolean"
              },
              "frequency": {
                "type": "string",
                "example": "0 9 * * *",
                "description": "Valid five-field cron expression. Scheduler timezone: Africa/Casablanca."
              }
            },
            "required": [
              "enabled",
              "frequency"
            ],
            "additionalProperties": false
          }
        },
        "additionalProperties": false
      },
      "createdAt": {
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time"
      }
    },
    "required": [
      "_id",
      "key",
      "notifications",
      "jobs"
    ]
  },
  "PreferenceUpdate": {
    "type": "object",
    "properties": {
      "includeDraftCourses": {
        "type": "boolean",
        "default": false
      },
      "includeArchivedCourses": {
        "type": "boolean",
        "default": false
      },
      "includeEnrollmentStats": {
        "type": "boolean",
        "default": true
      },
      "includeProgressStats": {
        "type": "boolean",
        "default": true
      }
    },
    "additionalProperties": false,
    "minProperties": 1
  },
  "Preference": {
    "type": "object",
    "properties": {
      "_id": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "trainer": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "includeDraftCourses": {
        "type": "boolean",
        "default": false
      },
      "includeArchivedCourses": {
        "type": "boolean",
        "default": false
      },
      "includeEnrollmentStats": {
        "type": "boolean",
        "default": true
      },
      "includeProgressStats": {
        "type": "boolean",
        "default": true
      },
      "createdAt": {
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time"
      }
    },
    "required": [
      "_id",
      "trainer",
      "includeDraftCourses",
      "includeArchivedCourses",
      "includeEnrollmentStats",
      "includeProgressStats"
    ]
  },
  "JobExecution": {
    "type": "object",
    "properties": {
      "_id": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "jobName": {
        "type": "string",
        "enum": [
          "inactiveLearnerReminder",
          "trainerSummary",
          "statsRefresh"
        ]
      },
      "status": {
        "type": "string",
        "enum": [
          "running",
          "success",
          "failed"
        ]
      },
      "startedAt": {
        "type": "string",
        "format": "date-time"
      },
      "finishedAt": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "result": {
        "nullable": true,
        "description": "Handler-specific JSON result; null until available."
      },
      "errorMessage": {
        "type": "string",
        "nullable": true
      },
      "createdAt": {
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time"
      }
    },
    "required": [
      "_id",
      "jobName",
      "status",
      "startedAt"
    ]
  },
  "TrainerCourseStats": {
    "type": "object",
    "properties": {
      "courseId": {
        "$ref": "#/components/schemas/ObjectId"
      },
      "courseTitle": {
        "type": "string"
      },
      "totalEnrollments": {
        "type": "integer",
        "minimum": 0,
        "description": "All enrollment statuses."
      },
      "averageProgress": {
        "type": "number",
        "minimum": 0,
        "maximum": 100,
        "description": "Average enrollment progress, rounded to two decimals."
      },
      "totalAttempts": {
        "type": "integer",
        "minimum": 0,
        "description": "All quiz attempts across the course modules."
      },
      "passedAttempts": {
        "type": "integer",
        "minimum": 0
      },
      "averageScore": {
        "type": "number",
        "minimum": 0,
        "maximum": 100,
        "description": "Average scorePercent across all attempts, rounded to two decimals."
      },
      "feedbackCount": {
        "type": "integer",
        "minimum": 0
      }
    },
    "required": [
      "courseId",
      "courseTitle",
      "totalEnrollments",
      "averageProgress",
      "totalAttempts",
      "passedAttempts",
      "averageScore",
      "feedbackCount"
    ],
    "additionalProperties": false
  },
  "TrainerStatsResponse": {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "enum": [
          "trainer statistics retrieved successfully"
        ]
      },
      "data": {
        "type": "object",
        "properties": {
          "dataAvailable": {
            "type": "boolean"
          },
          "refreshedAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true,
            "description": "Latest successful global statsRefresh finishedAt; null without a snapshot."
          },
          "courses": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TrainerCourseStats"
            }
          }
        },
        "required": [
          "dataAvailable",
          "refreshedAt",
          "courses"
        ],
        "additionalProperties": false
      }
    },
    "required": [
      "message",
      "data"
    ],
    "additionalProperties": false
  }
};
