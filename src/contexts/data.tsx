import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useToast } from "@/contexts/toast";
import { AuthServer, Player } from "@/models/account";
import { GameInstanceSummary } from "@/models/game-instance";
import { mockGameInstanceSummaryList } from "@/models/mock/game-instance";
import accountService from "@/services/account";

interface DataContextType {
  playerList: Player[];
  selectedPlayer: Player | undefined;
  gameInstanceSummaryList: GameInstanceSummary[];
  selectedGameInstance: GameInstanceSummary | undefined;
  authServerList: AuthServer[];
  handlePlayerList: () => void;
  handleSelectedPlayer: () => void;
  handleAuthServerList: () => void;
}

interface DataDispatchContextType {
  setPlayerList: React.Dispatch<Player[]>;
  setSelectedPlayer: React.Dispatch<Player | undefined>;
  setGameInstanceSummaryList: React.Dispatch<GameInstanceSummary[]>;
  setSelectedGameInstance: React.Dispatch<GameInstanceSummary | undefined>;
  setAuthServerList: React.Dispatch<AuthServer[]>;
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
  const { getAuthServerList, getPlayerList, getSelectedPlayer } =
    accountService;

  const handlePlayerList = useCallback(() => {
    getPlayerList().then((response) => {
      if (response.status === "success") {
        setPlayerList(response.data);
        if (response.data.length > 0) {
          setSelectedPlayer(response.data[0]);
        }
      } else {
        toast({
          title: response.message,
          description: response.details,
          status: "error",
        });
      }
    });
  }, [getPlayerList, toast]);

  const handleSelectedPlayer = useCallback(() => {
    getSelectedPlayer().then((response) => {
      if (response.status === "success") setSelectedPlayer(response.data);
      else setSelectedPlayer(undefined);
    });
  }, [getSelectedPlayer]);

  const handleAuthServerList = useCallback(() => {
    getAuthServerList().then((response) => {
      if (response.status === "success") setAuthServerList(response.data);
      else
        toast({
          title: response.message,
          description: response.details,
          status: "error",
        });
    });
  }, [getAuthServerList, toast]);

  useEffect(() => {
    handlePlayerList();
  }, [handlePlayerList]);

  useEffect(() => {
    handleAuthServerList();
  }, [handleAuthServerList]);

  useEffect(() => {
    handleSelectedPlayer();
  }, [handleSelectedPlayer]);

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
        handlePlayerList,
        handleSelectedPlayer,
        handleAuthServerList,
      }}
    >
      <DataDispatchContext.Provider
        value={{
          setPlayerList,
          setSelectedPlayer,
          setGameInstanceSummaryList,
          setSelectedGameInstance,
          setAuthServerList,
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
