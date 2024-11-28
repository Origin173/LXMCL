import React, { createContext, useContext, ReactNode } from "react";
import { createStandaloneToast, UseToastOptions } from "@chakra-ui/react";

const { ToastContainer, toast } = createStandaloneToast();

interface ToastContextProviderProps {
  children: ReactNode;
}

interface ToastContextType {
  (options: UseToastOptions): void;
}

const customToast = (options: UseToastOptions) => {
  toast({
    position: "bottom-left",
    duration: 3000,
    variant: "left-accent",
    isClosable: true,
    ...options,
  });
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastContextProvider: React.FC<ToastContextProviderProps> = ({
  children,
}) => {
  return (
    <ToastContext.Provider value={customToast}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast must be used within a ToastContextProvider");
  return context;
};
