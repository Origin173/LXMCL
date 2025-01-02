import { useTranslation } from "react-i18next";
import { Section } from "@/components/common/section";

export const DiscoverSourcesPage = () => {
  const { t } = useTranslation();

  return (
    <Section
      className="content-full-y"
      title={t("DiscoverPage.Button.sources")}
      withBackButton
    ></Section>
  );
};

export default DiscoverSourcesPage;
