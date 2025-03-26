import { useEffect, useState } from "react";
import GameAdvancedSettingsGroups from "@/components/game-advanced-settings-group";
import { useInstanceSharedData } from "@/contexts/instance";
import { GameConfig } from "@/models/config";

const InstanceGameAdvancedSettingsPage = () => {
  const { getInstanceGameConfig, handleUpdateInstanceConfig } =
    useInstanceSharedData();
  const [gameConfig, setGameConfig] = useState<GameConfig>();

  useEffect(() => {
    setGameConfig(getInstanceGameConfig());
  }, [getInstanceGameConfig]);

  return (
    <>
      {gameConfig && (
        <GameAdvancedSettingsGroups
          gameConfig={gameConfig}
          updateGameConfig={(key: string, value: any) => {
            handleUpdateInstanceConfig(`specGameConfig.${key}`, value);
          }}
        />
      )}
    </>
  );
};

export default InstanceGameAdvancedSettingsPage;
