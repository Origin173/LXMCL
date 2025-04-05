import { HStack, Text } from "@chakra-ui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

const PingSettingsPage = () => {
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
        title: "BMCLAPI 镜像服务",
        description: "https://bmclapi2.bangbang93.com",
      },
      {
        id: "curseforge",
        title: "CurseForge API",
        description: "https://api.curseforge.com",
      },
      {
        id: "modrinth",
        title: "Modrinth API",
        description: "https://api.modrinth.com",
      },
      {
        id: "mojang",
        title: "BugJump",
        description: "https://api.mojang.com",
      },
      {
        id: "github",
        title: "GitHub",
        description: "https://www.github.com",
      },
      {
        id: "sjtu",
        title: "上海交通大学Minecraft社",
        description: "https://mc.sjtu.cn",
      },
    ],
    []
  );

  const checkService = useCallback(
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
      await Promise.allSettled(services.map((s) => checkService(s.id)));
      setRefreshCount((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    }
  }, [checkService, services]);

  useEffect(() => {
    const initialCheck = async () => {
      await checkAllServices();
    };
    initialCheck();
  }, [checkAllServices]);

  const getStatusColor = (latency?: number) => {
    if (!latency) return "gray.500";
    if (latency < 200) return "green.500";
    if (latency < 500) return "yellow.500";
    return "red.500";
  };

  const generateItems = () => {
    return services.map((service) => {
      const status = servicesStatus[service.id] || { loading: true };

      return {
        title: service.title,
        description: service.description,
        children: status.loading ? (
          <BeatLoader size={4} color="#666" />
        ) : (
          <Text
            color={status.error ? "red.500" : getStatusColor(status.latency)}
            fontSize="sm"
            minWidth="60px"
            textAlign="right"
          >
            {status.error
              ? t("PingSettingsPage.PingServerList.offline")
              : `${status.latency}ms`}
          </Text>
        ),
      };
    });
  };

  return (
    <Section
      title={t("PingSettingsPage.PingServerList.title")}
      headExtra={
        <HStack spacing={2}>
          <CommonIconButton
            icon="refresh"
            label={t("PingSettingsPage.button.refresh")}
            onClick={checkAllServices}
            size="xs"
            fontSize="sm"
            h={21}
            isLoading={Object.values(servicesStatus).some((s) => s.loading)}
          />
        </HStack>
      }
    >
      <OptionItemGroup items={generateItems()} />
    </Section>
  );
};

export default PingSettingsPage;
