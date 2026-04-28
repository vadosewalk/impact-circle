import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { errorResponse } from "../lib/response";

import type { StatusCode } from "hono/utils/http-status";

export const errorHandler = (err: Error, c: Context) => {
  console.error(`[API ERROR]: ${err.stack || err.message}`);

  if (err instanceof HTTPException) {
    return errorResponse(c, err.message, undefined, err.status as StatusCode);
  }

  // Handle generic errors
  const isProduction = (typeof process !== "undefined" ? process.env?.NODE_ENV : c.env?.NODE_ENV) === "production";

  return errorResponse(c, isProduction ? "An internal server error occurred" : err.message, undefined, 500);
};

export const notFoundHandler = (c: Context) => {
  return errorResponse(c, `Route not found: ${c.req.method} ${c.req.url}`, undefined, 404);
};
