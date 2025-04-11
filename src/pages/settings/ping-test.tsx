import { HStack, Tag, TagLabel } from "@chakra-ui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuX } from "react-icons/lu";
import { BeatLoader } from "react-spinners";
import { CommonIconButton } from "@/components/common/common-icon-button";
import { OptionItemGroup } from "@/components/common/option-item";
import { Section } from "@/components/common/section";
import { checkServiceAvailability } from "@/services/utils";

interface ServiceStatus {
  loading: boolean;
  latency?: number;
  error: boolean;
}

interface ServiceConfig {
  id: string;
  url: string;
}

const PingTestPage = () => {
  const { t } = useTranslation();

  const [servicesStatus, setServicesStatus] = useState<
    Record<string, ServiceStatus>
  >({});

  const services = useMemo<ServiceConfig[]>(
    () => [
      { id: "bmclapi", url: "https://bmclapi2.bangbang93.com" },
      { id: "curseforge", url: "https://api.curseforge.com" },
      { id: "modrinth", url: "https://api.modrinth.com" },
      { id: "mojang", url: "https://api.mojang.com" },
      { id: "github", url: "https://www.github.com" },
      { id: "sjmclapi", url: "https://mc.sjtu.cn/api-sjmcl" },
    ],
    []
  );

  const handleCheckServiceAvailability = useCallback(
    async (serviceId: string) => {
      const service = services.find((s) => s.id === serviceId);
      if (!service) return;

      try {
        setServicesStatus((prev) => ({
          ...prev,
          [serviceId]: { loading: true, error: false },
        }));

        const latency = await checkServiceAvailability(service.url);

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
        title: t(`PingTestPage.PingServerList.${service.id}`),
        description: service.url,
        children: status.loading ? (
          <BeatLoader size={6} color="grey" />
        ) : (
          <Tag
            colorScheme={
              status.error
                ? "red"
                : (status.latency || 0) < 200
                  ? "green"
                  : "yellow"
            }
          >
            <HStack spacing={0.5}>
              {status.error ? (
                <>
                  <LuX />
                  <TagLabel>
                    {t("PingTestPage.PingServerList.offline")}
                  </TagLabel>
                </>
              ) : (
                <>
                  <LuCheck />
                  <TagLabel>{status.latency}</TagLabel>
                  <TagLabel>ms</TagLabel>
                </>
              )}
            </HStack>
          </Tag>
        ),
      };
    });
  };

  return (
    <Section
      title={t("PingTestPage.PingServerList.title")}
      withBackButton
      headExtra={
        <CommonIconButton
          icon="refresh"
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
