require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");

beforeAll(async () => {
  const uri = process.env.MONGO_TEST_URI;

  if (!uri) {
    throw new Error("MONGO_TEST_URI is required");
  }

  await mongoose.connect(uri, {
    dbName: "lms_test",
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});