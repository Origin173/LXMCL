import { listen } from "@tauri-apps/api/event";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSharedModals } from "@/contexts/shared-modal";
import { useToast } from "@/contexts/toast";
import useDeepLink from "@/hooks/deep-link";
import { useDragAndDrop } from "@/hooks/drag-and-drop";
import useKeyboardShortcut from "@/hooks/keyboard-shortcut";

// Handle global keyboard shortcuts, DnD events, etc.
const GlobalEventHandler: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { openSharedModal } = useSharedModals();
  const toast = useToast();
  const router = useRouter();
  const isStandAlone = router.pathname.startsWith("/standalone");

  // 全局状态：存储待处理的 OpenList 导入任务
  const pendingImportsRef = useRef<Map<string, string>>(new Map());

  // ------------------- OpenList 下载完成监听 -------------------
  useEffect(() => {
    let unlistenGroupUpdate: (() => void) | null = null;

    const setupOpenListListener = async () => {
      console.log("[GlobalEventHandler] Setting up OpenList task listener...");
      console.log(
        "[GlobalEventHandler] Current pending imports:",
        pendingImportsRef.current.size
      );

      // 监听任务组更新事件 (task:group-update)
      // 这是下载任务完成时发送的事件
      unlistenGroupUpdate = await listen<any>("task:group-update", (event) => {
        const taskGroup =
          event.payload?.task_group || event.payload?.taskGroup || "";
        const eventStatus = event.payload?.event;

        // 记录所有 OpenList 相关的事件
        if (taskGroup && taskGroup.startsWith("openlist:")) {
          console.log("[GlobalEventHandler] OpenList group event received:", {
            event: eventStatus,
            taskGroup: taskGroup,
            payload: event.payload,
          });
        }

        const isCompleted = eventStatus === "Completed";

        if (isCompleted) {
          console.log(
            "[GlobalEventHandler] Task group completed, taskGroup:",
            taskGroup
          );

          if (taskGroup && taskGroup.startsWith("openlist:")) {
            console.log(
              "[GlobalEventHandler] OpenList download task completed"
            );

            const pendingImports = pendingImportsRef.current;
            let matchedPath: string | null = null;
            let matchedKey: string | null = null;

            pendingImports.forEach((path, savedPrefix) => {
              if (taskGroup.startsWith(savedPrefix)) {
                matchedPath = path;
                matchedKey = savedPrefix;
                console.log(
                  "[GlobalEventHandler] Match found:",
                  savedPrefix,
                  "->",
                  path
                );
              }
            });

            if (matchedPath && matchedKey) {
              console.log(
                "[GlobalEventHandler] Opening import modal for:",
                matchedPath
              );

              toast({
                title: "下载完成",
                description: `文件已下载完成，正在打开导入向导...`,
                status: "success",
                duration: 3000,
                isClosable: true,
              });

              openSharedModal("import-modpack", {
                path: matchedPath,
              });

              pendingImports.delete(matchedKey);
              console.log(
                "[GlobalEventHandler] Removed pending import:",
                matchedKey
              );
            } else {
              console.warn(
                "[GlobalEventHandler] No matching file path found for:",
                taskGroup
              );
            }
          }
        }
      });

      console.log(
        "[GlobalEventHandler] OpenList task listener registered successfully"
      );
    };

    setupOpenListListener();

    return () => {
      console.log("[GlobalEventHandler] Cleaning up OpenList task listener...");
      if (unlistenGroupUpdate) unlistenGroupUpdate();
    };
  }, [toast, openSharedModal]);

  // 暴露方法供其他组件注册待处理的导入
  useEffect(() => {
    console.log(
      "[GlobalEventHandler] Mounting registerOpenListDownload method"
    );

    // 在 window 对象上挂载注册方法
    (window as any).registerOpenListDownload = (
      taskGroupPrefix: string,
      downloadedPath: string
    ) => {
      console.log(
        "[GlobalEventHandler] Registered OpenList download:",
        taskGroupPrefix,
        "->",
        downloadedPath
      );
      pendingImportsRef.current.set(taskGroupPrefix, downloadedPath);
      console.log(
        "[GlobalEventHandler] Total pending imports:",
        pendingImportsRef.current.size
      );
    };

    return () => {
      console.log(
        "[GlobalEventHandler] Unmounting registerOpenListDownload method"
      );
      delete (window as any).registerOpenListDownload;
    };
  }, []);

  // ----------------- Keyboard Shortcuts -----------------
  const spotlightShortcuts = useMemo(
    () => ({
      macos: { metaKey: true, key: "S" },
      windows: { ctrlKey: true, key: "S" },
      linux: { ctrlKey: true, key: "S" },
    }),
    []
  );

  const openSpotlightSearch = useCallback(() => {
    if (!isStandAlone) openSharedModal("spotlight-search");
  }, [isStandAlone, openSharedModal]);

  useKeyboardShortcut(spotlightShortcuts, openSpotlightSearch);

  // ------------------- Drag and Drops -------------------

  const addAuthServerByDnD = useCallback(
    (data: string) => {
      const prefix = "authlib-injector:yggdrasil-server:";
      if (data.startsWith(prefix)) {
        const url = data.slice(prefix.length);
        const decodeUrl = decodeURIComponent(url);
        if (!isStandAlone && decodeUrl)
          openSharedModal("add-auth-server", { presetUrl: decodeUrl });
      }
    },
    [isStandAlone, openSharedModal]
  );

  useDragAndDrop({
    onDrop: addAuthServerByDnD,
  });

  // KNOWN ISSUE: https://github.com/tauri-apps/tauri/issues/14055
  // useTauriFileDrop({
  //   pattern: "\\.zip$",
  //   onMatch: (path) => openSharedModal("import-modpack", { path }),
  // });

  // ---------------------- Deeplinks ---------------------

  // Note: These triggers appear to be ordinary strings on the surface,
  //       but they are actually syntactic sugar for JavaScript,
  //       being parsed into RegExp objects,
  //       which can affect the `Object.is()` comparison.
  const addAuthServerTrigger = useMemo(
    () => /^add-auth-server\/?(?:\?.*)?$/,
    []
  );
  const launchTrigger = useMemo(() => /^launch\/?(?:\?.*)?$/, []);

  const addAuthServerByDeeplink = useCallback(
    (path: string | URL) => {
      const url = new URL(path).searchParams.get("url") || "";
      const decodeUrl = decodeURIComponent(url);
      if (!isStandAlone && decodeUrl) {
        openSharedModal("add-auth-server", { presetUrl: decodeUrl });
      }
    },
    [isStandAlone, openSharedModal]
  );

  const quickLaunchGame = useCallback(
    (path: string | URL) => {
      const id = new URL(path).searchParams.get("id") || "";
      const decodeId = decodeURIComponent(id);
      if (!isStandAlone && decodeId) {
        // Delay the modal opening to ensure required app state/data (e.g. selected player in global-data context) is ready.
        // This is important when the app is opened via deeplink.
        // FIXME: find a better way to handle this.
        setTimeout(() => {
          openSharedModal("launch", { instanceId: decodeId });
        }, 500);
      }
    },
    [isStandAlone, openSharedModal]
  );

  useDeepLink({
    trigger: addAuthServerTrigger,
    onCall: addAuthServerByDeeplink,
  });

  useDeepLink({
    trigger: launchTrigger,
    onCall: quickLaunchGame,
  });

  return <>{children}</>;
};

export default GlobalEventHandler;
