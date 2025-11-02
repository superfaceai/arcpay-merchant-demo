import { z } from "zod";

type ValidationError = {
  paramPath: PropertyKey[];
  message: string;
};

export type ValidationErrorResponseFactory = (
  errors: ValidationError[]
) => Response;

export function withValidation<
  BodySchema extends z.ZodTypeAny,
  ParamsSchema extends z.ZodTypeAny
>(
  validation: { body: BodySchema; params: ParamsSchema },
  handler: (
    request: Request,
    data: {
      body: z.infer<BodySchema>;
      params: z.infer<ParamsSchema>;
    }
  ) => Promise<Response>,
  formatErrorResponse?: ValidationErrorResponseFactory
): (
  request: Request,
  { params }: { params: Promise<z.infer<ParamsSchema>> }
) => Promise<Response>;
export function withValidation<ParamsSchema extends z.ZodTypeAny>(
  validation: undefined,
  handler: (
    request: Request,
    data: {
      body: undefined;
      params: z.infer<ParamsSchema>;
    }
  ) => Promise<Response>,
  formatErrorResponse?: ValidationErrorResponseFactory
): (
  request: Request,
  { params }: { params: Promise<z.infer<ParamsSchema>> }
) => Promise<Response>;
export function withValidation<
  BodySchema extends z.ZodTypeAny,
  ParamsSchema extends z.ZodTypeAny
>(
  validation: { body: BodySchema; params: ParamsSchema } | undefined,
  handler: (
    request: Request,
    data: {
      body: z.infer<BodySchema> | undefined;
      params: z.infer<ParamsSchema>;
    }
  ) => Promise<Response>,
  formatErrorResponse = defaultFormatErrorResponse
): (
  request: Request,
  { params }: { params: Promise<z.infer<ParamsSchema>> }
) => Promise<Response> {
  return async (
    request: Request,
    { params }: { params: Promise<z.infer<ParamsSchema>> }
  ) => {
    const requestBody = await request.text();
    const resolvedParams = await params;

    if (!validation) return handler(request, { body: undefined, params: resolvedParams });

    const jsonBody = (function () {
      try {
        return JSON.parse(requestBody);
      } catch {
        return null;
      }
    })();

    if (!jsonBody)
      return formatErrorResponse([
        { paramPath: [], message: "Invalid JSON in body" },
      ]);

    const validated = validation.body?.safeParse(jsonBody);

    if (!validated?.success) {
      const errors: ValidationError[] = validated?.error.issues.map(
        (error) => ({ paramPath: error.path, message: error.message })
      );

      return formatErrorResponse(errors);
    }

    return handler(request, { body: validated.data, params: resolvedParams });
  };
}

const defaultFormatErrorResponse: ValidationErrorResponseFactory = (errors) => {
  const detail =
    errors.length < 1
      ? "Invalid payload in body"
      : errors
          .map((error) => `[${error.paramPath.join("/")}] ${error.message}`)
          .join(", ");

  return Response.json(
    {
      title: "Bad request",
      detail,
    },
    { status: 400, headers: { "Content-Type": "application/problem+json" } }
  );
};
