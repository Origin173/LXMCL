import { useTranslation } from 'react-i18next';
import { OptionItemGroupProps, OptionItemGroup } from "@/components/common/option-item";
import { TitleFull } from '@/components/logo-title';
import LinkIconButton from '@/components/common/link-icon-button';

const AboutSettingsPage = () => {
  const { t } = useTranslation();

  const aboutSettingGroups: OptionItemGroupProps[] = [
    {
      title: t("AboutSettingsPage.about.title"),
      items: [
        <TitleFull my={1} key={0}/>,
        {
          title: t("AboutSettingsPage.about.settings.version.title"),
          children: "dev"
        },
        {
          title: t("AboutSettingsPage.about.settings.contributors.title"),
          children: <LinkIconButton url="https://github.com/UNIkeEN/SJMCL/graphs/contributors" aria-label="contributors" isExternal h={18}/>
        },
        {
          title: t("AboutSettingsPage.about.settings.reportIssue.title"),
          children: <LinkIconButton url="https://github.com/UNIkeEN/SJMCL/issues/new" aria-label="issue" isExternal h={18}/>
        },
        {
          title: t("AboutSettingsPage.about.settings.aboutSJMC.title"),
          children: <LinkIconButton url="https://mc.sjtu.cn/welcome/content/3/" aria-label="aboutSJMC" isExternal h={18}/>
        }
      ]
    },
    {
      title: t("AboutSettingsPage.ack.title"),
      items: [
        {
          title: t("AboutSettingsPage.ack.settings.bmclapi.title"),
          description: t("AboutSettingsPage.ack.settings.bmclapi.description"),
          children: <LinkIconButton url="https://bmclapidoc.bangbang93.com/" aria-label="bmclapi" isExternal/>
        }
      ]
    },
    {
      title: t("AboutSettingsPage.legalInfo.title"),
      items: [
        {
          title: t("AboutSettingsPage.legalInfo.settings.copyright.title"),
          description: t("AboutSettingsPage.legalInfo.settings.copyright.description"),
          children: <></>
        },
        {
          title: t("AboutSettingsPage.legalInfo.settings.userAgreement.title"),
          children: <LinkIconButton url="about:blank" aria-label="userAgreement" isExternal h={18} isDisabled/>  // TBD
        },
        {
          title: t("AboutSettingsPage.legalInfo.settings.openSourceLicense.title"),
          description: t("AboutSettingsPage.legalInfo.settings.openSourceLicense.description"),
          children: <LinkIconButton url="https://github.com/UNIkeEN/SJMCL?tab=GPL-3.0-1-ov-file#readme" aria-label="openSourceLicense" isExternal/> 
        }
      ]
    }
  ]

  return (
    <>
      {aboutSettingGroups.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
}

export default AboutSettingsPage;