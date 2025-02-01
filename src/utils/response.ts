import { t } from "i18next";
import { InvokeResponse } from "@/models/response";

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

    descriptor.value = async function (
      ...args: any[]
    ): Promise<InvokeResponse<any>> {
      try {
        const data = await originalMethod.apply(this, args);
        const message = t(
          `Services.${serviceDomain}.${String(propertyKey)}.success`
        );
        return { status: "success", message, data };
      } catch (error: any) {
        const message = t(
          `Services.${serviceDomain}.${String(propertyKey)}.error.title`
        );
        const detailsKey = errorToLocaleKey[String(error)];
        const details = detailsKey
          ? t(
              `Services.${serviceDomain}.${String(propertyKey)}.error.description.${detailsKey}`
            )
          : "";
        return { status: "error", message, details, raw_error: error };
      }
    };

    return descriptor;
  };
}
