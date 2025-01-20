import { ResponseError, ResponseSuccess } from "@/models/response";

export function responseHandler(
  serviceName: string,
  errorToLocaleKey: { [key: string]: string },
  t: (key: string) => string
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
          `Services.${serviceName}.${String(propertyKey)}.success`
        );
        return { status: "success", message, data };
      } catch (error: any) {
        const message = t(
          `Services.${serviceName}.${String(propertyKey)}.error.title`
        );
        const details = t(
          `Services.${serviceName}.${String(propertyKey)}.error.description.${errorToLocaleKey[error.message] || "unknown"}`
        );
        return { status: "error", message, details };
      }
    };

    return descriptor;
  };
}
