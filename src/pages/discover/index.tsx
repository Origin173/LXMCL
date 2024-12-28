import { Button, HStack } from "@chakra-ui/react";
import { Masonry } from "masonic";
import { useTranslation } from "react-i18next";
import { LuNewspaper, LuRefreshCcw } from "react-icons/lu";
import { Section } from "@/components/common/section";
import PosterCard from "@/components/poster-card";
import { useLauncherConfig } from "@/contexts/config";
import { mockPosts } from "@/models/mock/post";

export const DiscoverPage = () => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  return (
    <Section
      className="content-full-y"
      title={t("DiscoverPage.title")}
      headExtra={
        <HStack spacing={2}>
          <Button
            leftIcon={<LuNewspaper />}
            size="xs"
            colorScheme={primaryColor}
            variant={primaryColor === "gray" ? "subtle" : "outline"}
            onClick={() => {}} // TODO
          >
            {t("DiscoverPage.Button.sources")}
          </Button>
          <Button
            leftIcon={<LuRefreshCcw />}
            size="xs"
            colorScheme={primaryColor}
            onClick={() => {}} // TODO
          >
            {t("DiscoverPage.Button.refresh")}
          </Button>
        </HStack>
      }
    >
      <Masonry items={mockPosts} render={PosterCard} columnGutter={14} />
    </Section>
  );
};

export default DiscoverPage;
