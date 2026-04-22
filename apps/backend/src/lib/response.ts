import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
};

const apiResponse = (c: Context, { success, message, data, errors, status }: ApiResponse<any> & { status: number }) => {
  return c.json(
    {
      success,
      message,
      data,
      errors,
    },
    status as ContentfulStatusCode,
  );
};

export const successResponse = (c: Context, message: string, data?: unknown, status: number = 200) => {
  return apiResponse(c, { success: true, message, data, status });
};

export const errorResponse = (c: Context, message: string, errors?: unknown, status: number = 400) => {
  return apiResponse(c, { success: false, message, errors, status });
};
