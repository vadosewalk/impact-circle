import type { Context } from "hono";

export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
};

export const apiResponse = (
  c: Context,
  { success, message, data, errors, status = 200 }: ApiResponse & { status?: number },
) => {
  return c.json(
    {
      success,
      message,
      data,
      errors,
    },
    status as any,
  );
};

export const successResponse = (c: Context, message: string, data?: any, status = 200) => {
  return apiResponse(c, { success: true, message, data, status });
};

export const errorResponse = (c: Context, message: string, errors?: any, status = 400) => {
  return apiResponse(c, { success: false, message, errors, status });
};
