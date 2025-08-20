import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

// Generic validation function
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      return { success: false, error: errorMessage };
    }
    return { success: false, error: "Validation failed" };
  }
}

// Validate query parameters from URL
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest,
): { success: true; data: T } | { success: false; error: string } {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  return validateData(schema, params);
}

// Validate JSON body from request
export async function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  request: Request,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    return validateData(schema, body);
  } catch {
    return { success: false, error: "Invalid JSON body" };
  }
}

// Create validation error response
export function createValidationErrorResponse(error: string) {
  return NextResponse.json(
    {
      status: "error",
      message: "Validation failed",
      error: error,
    },
    { status: 400 },
  );
}

// Safe parse with default value
export function safeParseWithDefault<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  defaultValue: T,
): T {
  const result = schema.safeParse(data);
  return result.success ? result.data : defaultValue;
}
