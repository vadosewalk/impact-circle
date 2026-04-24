import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  schemaFilter: ["public"],
  tablesFilter: [
    "account",
    "beneficiary_updates",
    "categories",
    "comments",
    "drive_updates",
    "drives",
    "invitation",
    "member",
    "messages",
    "ngo",
    "organization",
    "polls",
    "session",
    "user",
    "verification",
  ],
});
