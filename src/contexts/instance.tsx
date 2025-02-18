import { useRouter } from "next/router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useData } from "@/contexts/data";
import { useToast } from "@/contexts/toast";
import { useGetState } from "@/hooks/get-state";
import { GameInstanceSummary, Screenshot } from "@/models/game-instance";
import { InstanceService } from "@/services/instance";

export interface InstanceContextType {
  summary: GameInstanceSummary | undefined;
  getScreenshotList: (sync?: boolean) => Screenshot[] | undefined;
}

export const InstanceContext = createContext<InstanceContextType | undefined>(
  undefined
);

export const InstanceContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();
  const toast = useToast();
  const { getGameInstanceList } = useData();

  const [instanceSummary, setInstanceSummary] = useState<
    GameInstanceSummary | undefined
  >(undefined);
  const [screenshots, setScreenshots] = useState<Screenshot[]>();

  useEffect(() => {
    const gameInstanceList = getGameInstanceList() || [];
    const instanceId = router.query.id;
    if (instanceId !== undefined) {
      setInstanceSummary(
        gameInstanceList.find((instance) => instance.id === Number(instanceId))
      );
    }
  }, [router.query.id, getGameInstanceList]);

  const handleRetriveScreenshotList = useCallback(() => {
    if (instanceSummary?.id !== undefined) {
      InstanceService.retriveScreenshotList(instanceSummary.id).then(
        (response) => {
          if (response.status === "success") setScreenshots(response.data);
          else
            toast({
              title: response.message,
              description: response.details,
              status: "error",
            });
        }
      );
    }
  }, [instanceSummary?.id, setScreenshots, toast]);

  const getScreenshotList = useGetState(
    screenshots,
    handleRetriveScreenshotList
  );

  return (
    <InstanceContext.Provider
      value={{
        summary: instanceSummary,
        getScreenshotList,
      }}
    >
      {children}
    </InstanceContext.Provider>
  );
};

export const useInstanceSharedData = (): InstanceContextType => {
  const context = useContext(InstanceContext);
  if (!context) {
    throw new Error(
      "useInstanceSharedData must be used within a InstanceContextProvider"
    );
  }
  return context;
};
