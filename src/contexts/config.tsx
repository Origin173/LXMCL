import React, { createContext, useContext, useState, useEffect } from "react";
import { LauncherConfig, defaultConfig } from "@/models/config"
import { changeLanguage } from "@/locales";

interface LauncherConfigContextType {
  config: LauncherConfig;
  update: (path: string, value: any) => void;
}

const LauncherConfigContext = createContext<LauncherConfigContextType | undefined>(
  undefined
);

export const LauncherConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<LauncherConfig>(defaultConfig);


  useEffect(() => {
    // only for mock, @TODO: get from backend
    setTimeout(() => {
      update("mocked", false);
    }, 1000);
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
    // TODO: save to backend

    setConfig((prevConfig) => {
      const newConfig = { ...prevConfig };
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