import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useState } from "react";

type RoutingHistoryContextType = {
  history: string[];
};

const RoutingHistoryContext = createContext<
  RoutingHistoryContextType | undefined
>(undefined);

export const RoutingHistoryContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [history, setHistory] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (route: string) => {
      setHistory((prev) => {
        if (prev[prev.length - 1] === route) {
          return prev;
        }
        return [...prev, route];
      });
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <RoutingHistoryContext.Provider value={{ history }}>
      {children}
    </RoutingHistoryContext.Provider>
  );
};

export const useRoutingHistory = (): RoutingHistoryContextType => {
  const context = useContext(RoutingHistoryContext);
  if (!context) {
    throw new Error(
      "useRoutingHistory must be used within a RoutingHistoryContextProvider"
    );
  }
  return context;
};
