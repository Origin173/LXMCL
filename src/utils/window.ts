import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export const createWindow = (
  label?: string, // only allow to contain a-zA-Z plus "-", "/", ":", "_" (space will convert to "_")
  route?: string,
  options?: any // Omit<WebviewOptions, 'x' | 'y' | 'width' | 'height'> & WindowOptions)
): WebviewWindow => {
  // use current timestamp as the unique label if none is provided
  let windowLabel = label || `${Date.now()}`;

  windowLabel = windowLabel.replaceAll(" ", "_");

  const webview = new WebviewWindow(windowLabel, {
    title: "",
    ...options,
    url: route || "/",
  });

  webview.once("tauri://created", () => {
    console.log(`Child window ${windowLabel} successfully created`);
  });

  webview.once("tauri://error", (error) => {
    console.error(`Failed to create child window ${windowLabel}:`, error);
  });

  return webview;
};
