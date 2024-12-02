import { invoke } from "@tauri-apps/api/core";
import React, { createContext, useContext, useEffect, useState } from "react";
import { changeLanguage } from "@/locales";
import { LauncherConfig, defaultConfig } from "@/models/config";

interface LauncherConfigContextType {
  config: LauncherConfig;
  update: (path: string, value: any) => void;
}

const LauncherConfigContext = createContext<
  LauncherConfigContextType | undefined
>(undefined);

export const LauncherConfigProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [config, setConfig] = useState<LauncherConfig>(defaultConfig);

  useEffect(() => {
    // TODO: migrate raw invoke to services/, add error catch
    invoke("get_launcher_config").then((config) => {
      setConfig(config as LauncherConfig);
    });
  }, []);

  useEffect(() => {
    changeLanguage(config.general.general.language);
  }, [config.general.general.language]);

  const updateByKeyPath = (obj: any, path: string, value: any): void => {
    const keys = path.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  };

  const update = (path: string, value: any) => {
    setConfig((prevConfig) => {
      const newConfig = { ...prevConfig };
      // TODO: migrate raw invoke to services/, add error catch
      invoke("update_launcher_config", { launcherConfig: newConfig }); // save to backend
      updateByKeyPath(newConfig, path, value);
      return newConfig;
    });
  };

  return (
    <LauncherConfigContext.Provider value={{ config, update }}>
      {children}
    </LauncherConfigContext.Provider>
  );
};

export const useLauncherConfig = (): LauncherConfigContextType => {
  const context = useContext(LauncherConfigContext);
  if (!context) {
    throw new Error("useLauncherConfig must be used within a ConfigProvider");
  }
  return context;
};
