import { useRouter } from "next/router";
import { useSharedModals } from "@/contexts/shared-modal";
import useDragAndDrop from "@/hooks/drag-and-drop";
import useKeyboardShortcut from "@/hooks/keyboard-shortcut";

// Handle global keyboard shortcuts, DnD events, etc.
const GlobalEventHandler: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { openSharedModal } = useSharedModals();
  const router = useRouter();
  const isStandAlone = router.pathname.startsWith("/standalone");

  useKeyboardShortcut(
    {
      macos: { metaKey: true, key: "s" },
      windows: { ctrlKey: true, key: "s" },
      linux: { ctrlKey: true, key: "s" },
    },
    () => {
      if (!isStandAlone) openSharedModal("spotlight-search");
    }
  );

  useDragAndDrop({
    mimeTypes: ["text/plain"],
    onDrop: (data) => {
      const prefix = "authlib-injector:yggdrasil-server:";
      if (data.startsWith(prefix)) {
        try {
          const url = decodeURIComponent(data.slice(prefix.length));
          if (!isStandAlone)
            openSharedModal("add-auth-server", { presetUrl: url });
        } catch (e) {
          console.error("Dropped invalid URL:", e);
        }
      }
    },
  });

  return <>{children}</>;
};

export default GlobalEventHandler;
