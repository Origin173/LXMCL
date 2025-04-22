import AddAuthServerModal from "@/components/modals/add-auth-server-modal";
import CopyOrMoveModal from "@/components/modals/copy-or-move-modal";
import DeleteGameInstanceDialog from "@/components/modals/delete-game-instance-alert-dialog";
import DownloadResourceModal from "@/components/modals/download-resource-modal";
import LaunchProcessModal from "@/components/modals/launch-process-modal";
import ReLoginPlayerModal from "@/components/modals/relogin-player-modal";
import SpotlightSearchModal from "@/components/modals/spotlight-search-modal";
import { SharedModalContextProvider } from "@/contexts/shared-modal";
import { useSharedModals } from "@/contexts/shared-modal";

const SharedModalsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SharedModalContextProvider>
      <SharedModals>{children}</SharedModals>
    </SharedModalContextProvider>
  );
};

const SharedModals: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { modalStates, closeSharedModal } = useSharedModals();

  const modals: Record<string, React.FC<any>> = {
    "add-auth-server": AddAuthServerModal,
    "copy-or-move": CopyOrMoveModal,
    "delete-game-instance-alert": DeleteGameInstanceDialog,
    "download-resource": DownloadResourceModal,
    launch: LaunchProcessModal,
    relogin: ReLoginPlayerModal,
    "spotlight-search": SpotlightSearchModal,
  };

  return (
    <>
      {children}

      {Object.keys(modals).map((key) => {
        const modalParams = modalStates[key];
        if (!modalParams) return null;

        const SpecModal = modals[key];
        return (
          <SpecModal
            key={key}
            {...modalParams}
            onClose={() => closeSharedModal(key)}
          />
        );
      })}
    </>
  );
};

export default SharedModalsProvider;
