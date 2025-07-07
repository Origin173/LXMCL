import {
  Button,
  Center,
  CircularProgress,
  CircularProgressLabel,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { LuArrowDownToLine } from "react-icons/lu";
import { useLauncherConfig } from "@/contexts/config";
import { useTaskContext } from "@/contexts/task";

export const DownloadIndicator: React.FC = () => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const { generalPercent } = useTaskContext();
  const primaryColor = config.appearance.theme.primaryColor;
  const router = useRouter();

  return (
    <Tooltip label={t("DownloadIndicator.tooltip")}>
      <Button
        variant="ghost"
        // colorScheme="blackAlpha"
        size="auto"
        borderRadius="full"
        onClick={() => {
          router.push("/downloads");
        }}
        className="drop-in-elastic"
      >
        <CircularProgress
          color={`${primaryColor}.500`}
          size="30px"
          value={generalPercent}
        >
          <CircularProgressLabel>
            <Center w="100%">
              <Icon as={LuArrowDownToLine} boxSize={3.5} />
            </Center>
          </CircularProgressLabel>
        </CircularProgress>
      </Button>
    </Tooltip>
  );
};
