import { useRouter } from "next/router";
import React, { createContext, useEffect, useState } from "react";
import { useData } from "@/contexts/data";
import { GameInstanceSummary } from "@/models/game-instance";

export interface InstanceContextType {
  currentInstanceSummary: GameInstanceSummary | undefined;
}

export const InstanceContext = createContext<InstanceContextType>({
  currentInstanceSummary: undefined,
});

export const InstanceContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();
  const [currentInstanceSummary, setCurrentInstanceSummary] = useState<
    GameInstanceSummary | undefined
  >(undefined);
  const { gameInstanceSummaryList } = useData();

  useEffect(() => {
    const instanceId = Number(router.query.id);
    if (instanceId) {
      setCurrentInstanceSummary(
        gameInstanceSummaryList.find((instance) => instance.id === instanceId)
      );
    }
  }, [router.query.id, gameInstanceSummaryList]);

  return (
    <InstanceContext.Provider value={{ currentInstanceSummary }}>
      {children}
    </InstanceContext.Provider>
  );
};
