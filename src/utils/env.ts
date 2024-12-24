export const isDev = process.env.NODE_ENV === "development";

export const isProd = process.env.NODE_ENV === "production";

export const checkFrontendCompatibility = () => {
  const checkList = [
    {
      label: "backdrop-filter-blur",
      check: () =>
        CSS.supports("backdrop-filter", "blur(1px)") ||
        CSS.supports("-webkit-backdrop-filter", "blur(1px)"),
      // TODO: on ubuntu, the check may be passed but still not display blur on bg correctly.
    },
  ];

  const failedChecks = checkList
    .filter((capability) => !capability.check())
    .map((capability) => capability.label);

  const allPassed = failedChecks.length === 0;

  return { allPassed, failedChecks };
};
