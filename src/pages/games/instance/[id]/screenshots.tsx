import { Icon, IconButton, Image, Tooltip } from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-shell";
import { useTranslation } from "react-i18next";
import { LuFolderOpen } from "react-icons/lu";
import { Section } from "@/components/common/section";
import { WrapCardGroup } from "@/components/common/wrap-card";
import { mockScreenshots } from "@/models/mock/game-instance";

const InstanceScreenshotsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Section>
      <WrapCardGroup
        cardAspectRatio={16 / 9}
        items={mockScreenshots.map((screenshot) => ({
          cardContent: (
            <>
              <Image
                src={screenshot.imgSrc}
                alt={screenshot.fileName}
                objectFit="cover"
                w="100%"
                h="100%"
                position="relative"
                borderRadius="md"
              />
              <Tooltip label={t("General.open")} placement="auto">
                <IconButton
                  icon={<Icon as={LuFolderOpen} />}
                  aria-label="open"
                  size="xs"
                  colorScheme="blackAlpha"
                  position="absolute"
                  top={1}
                  right={1}
                  onClick={() => {
                    open(screenshot.filePath);
                  }}
                />
              </Tooltip>
            </>
          ),
          p: 0,
        }))}
      />
    </Section>
  );
};

export default InstanceScreenshotsPage;
