import { UseToastOptions, useToast as chakraUseToast } from "@chakra-ui/react";
import React, { ReactNode, createContext, useContext } from "react";

interface ToastContextProviderProps {
  children: ReactNode;
}

interface ToastContextType {
  (options: UseToastOptions): void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastContextProvider: React.FC<ToastContextProviderProps> = ({
  children,
}) => {
  const chakraToast = chakraUseToast();

  const customToast: ToastContextType = (options) => {
    chakraToast({
      position: "bottom-left",
      duration: 3000,
      variant: "left-accent",
      isClosable: true,
      containerStyle: {
        minWidth: "2xs",
      },
      ...options,
    });
  };

  return (
    <ToastContext.Provider value={customToast}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast must be used within a ToastContextProvider");
  return context;
};
