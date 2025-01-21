import { IconButton } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { LuArrowRight } from "react-icons/lu";
import { OptionItemGroup } from "@/components/common/option-item";

const AddAndImportInstancePage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const addAndImportOptions: Record<string, () => void> = {
    new: () => {},
    modpack: () => {},
    manageDirs: () => router.push("/settings/global-game"),
  };

  return (
    <OptionItemGroup
      title={t("AllGamesPage.button.addAndImport")}
      items={Object.keys(addAndImportOptions).map((key) => ({
        title: t(`AddAndImportInstancePage.addAndImportOptions.${key}.title`),
        description: t(
          `AddAndImportInstancePage.addAndImportOptions.${key}.description`
        ),
        children: (
          <IconButton
            aria-label={key}
            onClick={addAndImportOptions[key]}
            variant="ghost"
            size="xs"
            icon={<LuArrowRight />}
          />
        ),
      }))}
    />
  );
};

export default AddAndImportInstancePage;
