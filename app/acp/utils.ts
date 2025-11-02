import { ValidationErrorResponseFactory } from "@/app/api/validation";
import { ResponseError } from "./schema";

export const makeACPValidationErrorResponse: ValidationErrorResponseFactory = (
  errors
) => {
  return Response.json(
    ResponseError.parse({
      type: "invalid_request",
      code: "invalid_payload",
      message: errors[0].message,
      param: `$.${errors[0].paramPath.join(".")}`,
    }),
    { status: 400 }
  );
};
