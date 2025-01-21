import { t } from "i18next";
import { ResponseError, ResponseSuccess } from "@/models/response";

export function responseHandler(
  serviceDomain: string,
  errorToLocaleKey: { [key: string]: string }
): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> | void {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const { data } = await originalMethod.apply(this, args);
        const message = t(
          `Services.${serviceDomain}.${String(propertyKey)}.success`
        );
        return { status: "success", message, data };
      } catch (error: any) {
        const message = t(
          `Services.${serviceDomain}.${String(propertyKey)}.error.title`
        );
        const details = t(
          `Services.${serviceDomain}.${String(propertyKey)}.error.description.${errorToLocaleKey[error.message] || "unknown"}`
        );
        return { status: "error", message, details };
      }
    };

    return descriptor;
  };
}
