import { useToast } from "@chakra-ui/react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { AuthServer, Player } from "@/models/account";
import { GameInstanceSummary } from "@/models/game-instance";
import { mockGameInstanceSummaryList } from "@/models/mock/game-instance";
import {
  getAuthServerList,
  getPlayerList,
  getSelectedPlayer,
} from "@/services/account";

interface DataContextType {
  playerList: Player[];
  selectedPlayer: Player | undefined;
  gameInstanceSummaryList: GameInstanceSummary[];
  selectedGameInstance: GameInstanceSummary | undefined;
  authServerList: AuthServer[];
}

interface DataDispatchContextType {
  setPlayerList: React.Dispatch<Player[]>;
  setSelectedPlayer: React.Dispatch<Player | undefined>;
  setGameInstanceSummaryList: React.Dispatch<GameInstanceSummary[]>;
  setSelectedGameInstance: React.Dispatch<GameInstanceSummary | undefined>;
  setAuthServerList: React.Dispatch<AuthServer[]>;
  fetchPlayerList: () => void;
  fetchSelectedPlayer: () => void;
  fetchAuthServerList: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DataDispatchContext = createContext<DataDispatchContextType | undefined>(
  undefined
);

export const DataContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [playerList, setPlayerList] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player>();
  const [gameInstanceSummaryList, setGameInstanceSummaryList] = useState<
    GameInstanceSummary[]
  >([]);
  const [selectedGameInstance, setSelectedGameInstance] =
    useState<GameInstanceSummary>();
  const [authServerList, setAuthServerList] = useState<AuthServer[]>([]);
  const toast = useToast();
  const { t } = useTranslation();

  const fetchPlayerList = useCallback(() => {
    getPlayerList()
      .then((playerList) => {
        setPlayerList(playerList);
        if (playerList.length > 0) {
          setSelectedPlayer(playerList[0]);
        }
      })
      .catch((error) => {
        toast({
          title: t("Services.account.getPlayerList.error"),
          status: "error",
        });
      });
  }, [toast, t]);

  const fetchSelectedPlayer = useCallback(() => {
    getSelectedPlayer()
      .then((player) => {
        setSelectedPlayer(player);
      })
      .catch((error) => {
        setSelectedPlayer(undefined);
      });
  }, []);

  const fetchAuthServerList = useCallback(() => {
    getAuthServerList()
      .then((authServerList) => {
        setAuthServerList(authServerList);
      })
      .catch((error) => {
        toast({
          title: t("Services.auth_server.getAuthServerList.error"),
          status: "error",
        });
      });
  }, [toast, t]);

  useEffect(() => {
    fetchPlayerList();
  }, [fetchPlayerList]);

  useEffect(() => {
    fetchAuthServerList();
  }, [fetchAuthServerList]);

  useEffect(() => {
    fetchSelectedPlayer();
  }, [fetchSelectedPlayer]);

  useEffect(() => {
    setGameInstanceSummaryList(mockGameInstanceSummaryList);
    setSelectedGameInstance(mockGameInstanceSummaryList[0]);
  }, []);

  return (
    <DataContext.Provider
      value={{
        playerList,
        selectedPlayer,
        gameInstanceSummaryList,
        selectedGameInstance,
        authServerList,
      }}
    >
      <DataDispatchContext.Provider
        value={{
          setPlayerList,
          setSelectedPlayer,
          setGameInstanceSummaryList,
          setSelectedGameInstance,
          setAuthServerList,
          fetchPlayerList,
          fetchSelectedPlayer,
          fetchAuthServerList,
        }}
      >
        {children}
      </DataDispatchContext.Provider>
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataContextProvider");
  }
  return context;
};

export const useDataDispatch = (): DataDispatchContextType => {
  const context = useContext(DataDispatchContext);
  if (!context) {
    throw new Error(
      "useDataDispatch must be used within a DataContextProvider"
    );
  }
  return context;
};
