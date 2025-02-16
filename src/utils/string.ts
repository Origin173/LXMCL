export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const extractFileName = (
  str: string,
  withExt: boolean = false
): string => {
  const fileName = str.split("/").pop() || "";
  return withExt ? fileName : fileName.split(".").slice(0, -1).join(".");
};

export const base64ImgSrc = (base64: string): string => {
  return `data:image/png;base64,${base64}`;
};
