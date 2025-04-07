import { HStack, Tag, TagLabel, Text } from "@chakra-ui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuX } from "react-icons/lu";
import { BeatLoader } from "react-spinners";
import { CommonIconButton } from "@/components/common/common-icon-button";
import { OptionItemGroup } from "@/components/common/option-item";
import { Section } from "@/components/common/section";
import { useLauncherConfig } from "@/contexts/config";
import { checkServiceAvailability } from "@/services/utils";

interface ServiceStatus {
  loading: boolean;
  latency?: number;
  error: boolean;
}

interface ServiceConfig {
  id: string;
  title: string;
  description: string;
}

const PingTestPage = () => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  const [servicesStatus, setServicesStatus] = useState<
    Record<string, ServiceStatus>
  >({});
  const [refreshCount, setRefreshCount] = useState(0);

  const services = useMemo<ServiceConfig[]>(
    () => [
      {
        id: "bmclapi",
        title: "BMCLAPI",
        description: "https://bmclapi2.bangbang93.com",
      },
      {
        id: "curseforge",
        title: "CurseForge",
        description: "https://api.curseforge.com",
      },
      {
        id: "modrinth",
        title: "Modrinth",
        description: "https://api.modrinth.com",
      },
      {
        id: "mojang",
        title: "Mojang",
        description: "https://api.mojang.com",
      },
      {
        id: "github",
        title: "GitHub",
        description: "https://www.github.com",
      },
      {
        id: "SJMC",
        title: "SJMC Launcher API",
        description: "https://mc.sjtu.cn/api-sjmcl",
      },
    ],
    []
  );

  const getLatencyColor = (latency?: number) => {
    if (!latency) return "gray.500";
    if (latency < 200) return "green.500";
    return "yellow.500";
  };

  const handleCheckServiceAvailability = useCallback(
    async (serviceId: string) => {
      const service = services.find((s) => s.id === serviceId);
      if (!service) return;

      try {
        setServicesStatus((prev) => ({
          ...prev,
          [serviceId]: { loading: true, error: false },
        }));

        const latency = await checkServiceAvailability(service.description);

        setServicesStatus((prev) => ({
          ...prev,
          [serviceId]: {
            loading: false,
            latency: latency || 0,
            error: false,
          },
        }));
      } catch (error) {
        setServicesStatus((prev) => ({
          ...prev,
          [serviceId]: { loading: false, error: true },
        }));
      }
    },
    [services]
  );

  const checkAllServices = useCallback(async () => {
    setServicesStatus((prev) => {
      const newStatus = { ...prev };
      services.forEach((service) => {
        newStatus[service.id] = { loading: true, error: false };
      });
      return newStatus;
    });

    try {
      await Promise.allSettled(
        services.map((s) => handleCheckServiceAvailability(s.id))
      );
      setRefreshCount((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    }
  }, [handleCheckServiceAvailability, services]);

  useEffect(() => {
    const initialCheck = async () => {
      await checkAllServices();
    };
    initialCheck();
  }, [checkAllServices]);

  const generateItems = () => {
    return services.map((service) => {
      const status = servicesStatus[service.id] || { loading: true };

      return {
        title: service.title,
        description: service.description,
        children: status.loading ? (
          <BeatLoader size={4} color="grey" />
        ) : (
          <HStack>
            {!status.error && (
              <Text color={getLatencyColor(status.latency)} fontSize="xs-sm">
                {`${status.latency} ms`}
              </Text>
            )}
            <Tag
              colorScheme={
                status.error
                  ? "red"
                  : (status.latency || 0) < 200
                    ? "green"
                    : "yellow"
              }
            >
              {status.error ? (
                <>
                  <LuX />
                  <TagLabel ml={0.5}>
                    {t("PingTestPage.PingServerList.offline")}
                  </TagLabel>
                </>
              ) : (
                <>
                  <LuCheck />
                  <TagLabel ml={0.5}>
                    {t("PingTestPage.PingServerList.online")}
                  </TagLabel>
                </>
              )}
            </Tag>
          </HStack>
        ),
      };
    });
  };

  return (
    <Section
      title={t("PingTestPage.PingServerList.title")}
      headExtra={
        <CommonIconButton
          icon="refresh"
          label={t("PingTestPage.button.refresh")}
          onClick={checkAllServices}
          size="xs"
          fontSize="sm"
          h={21}
          isLoading={Object.values(servicesStatus).some((s) => s.loading)}
        />
      }
    >
      <OptionItemGroup items={generateItems()} />
    </Section>
  );
};

export default PingTestPage;
