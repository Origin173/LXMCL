import { useCallback } from "react";

export function useGetState<T>(
  state: T | undefined,
  retriveHandler: () => void
): (sync?: boolean) => T | undefined {
  const getState = useCallback(
    (sync = false) => {
      if (sync || state === undefined) retriveHandler();
      return state;
    },
    [state, retriveHandler]
  );

  return getState;
}
