import {
  Flex,
  HStack,
  IconButton,
  Progress,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChevronRight, LuSettings } from "react-icons/lu";
import {
  LuChevronDown,
  LuPause,
  LuPlay,
  LuRotateCcw,
  LuX,
} from "react-icons/lu";
import { CommonIconButton } from "@/components/common/common-icon-button";
import Empty from "@/components/common/empty";
import { OptionItem, OptionItemGroup } from "@/components/common/option-item";
import { Section } from "@/components/common/section";
import { useLauncherConfig } from "@/contexts/config";
import { useTaskContext } from "@/contexts/task";
import { TaskDescStatusEnums, TaskGroupDesc } from "@/models/task";
import { formatTimeInterval } from "@/utils/datetime";
import { extractFileName, formatByteSize } from "@/utils/string";

export const DownloadTasksPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  const {
    tasks,
    handleScheduleProgressiveTaskGroup,
    handleCancelProgressiveTaskGroup,
    handleStopProgressiveTaskGroup,
    handleResumeProgressiveTaskGroup,
  } = useTaskContext();

  const [taskList, setTaskList] = useState<[TaskGroupDesc, boolean][]>([]); // boolean is used to record accordion state.

  useEffect(() => {
    setTaskList((prev) => {
      return tasks.map((task) => {
        return [
          task,
          prev.find((t) => t[0].taskGroup === task.taskGroup)?.[1] ?? true,
        ] as [TaskGroupDesc, boolean];
      });
    });
  }, [tasks, setTaskList]);

  const toggleTaskExpansion = (taskGroup: string) => {
    setTaskList((prevTasks) =>
      prevTasks.map((task) =>
        task[0].taskGroup === taskGroup ? [task[0], !task[1]] : task
      )
    );
  };

  return (
    <Section
      className="content-full-y"
      title={t("DownloadTasksPage.title")}
      withBackButton
      headExtra={
        <CommonIconButton
          icon={LuSettings}
          label={t("DownloadTasksPage.button.settings")}
          onClick={() => {
            router.push("/settings/download");
          }}
          size="xs"
          fontSize="sm"
          h={21}
        />
      }
    >
      <VStack align="stretch" px="10%" spacing={4}>
        {taskList.length === 0 && <Empty withIcon={false} size="sm" />}
        {taskList.map(([task, expanded]) => (
          <OptionItemGroup
            key={task.taskGroup}
            items={[
              <VStack align="stretch" key={task.taskGroup}>
                <Flex justify="space-between" alignItems="center">
                  <Text fontSize="xs-sm" fontWeight="bold">
                    {task.taskGroup}
                  </Text>

                  <HStack alignItems="center">
                    {task.estimatedTime && (
                      <Text fontSize="xs" className="secondary-text">
                        {`${formatTimeInterval(task.estimatedTime.secs)}`}
                      </Text>
                    )}

                    {task.status === TaskDescStatusEnums.Stopped && (
                      <Text fontSize="xs" className="secondary-text">
                        {t("DownloadTasksPage.label.paused")}
                      </Text>
                    )}

                    {(task.status === TaskDescStatusEnums.Failed ||
                      task.reason) && (
                      <Text fontSize="xs" color="red.600">
                        {task.reason || t("DownloadTasksPage.label.error")}
                      </Text>
                    )}

                    {task.status === TaskDescStatusEnums.Cancelled && (
                      <Text fontSize="xs" color="red.600">
                        {t("DownloadTasksPage.label.cancelled")}
                      </Text>
                    )}

                    {(task.status === TaskDescStatusEnums.Stopped ||
                      task.status === TaskDescStatusEnums.InProgress) && (
                      <Tooltip
                        label={t(
                          `DownloadTasksPage.button.${
                            task.status === TaskDescStatusEnums.InProgress
                              ? "pause"
                              : "begin"
                          }`
                        )}
                      >
                        <IconButton
                          aria-label="pause / download"
                          icon={
                            task.status === TaskDescStatusEnums.InProgress ? (
                              <LuPause />
                            ) : (
                              <LuPlay />
                            )
                          }
                          size="xs"
                          fontSize="sm"
                          h={21}
                          ml={1}
                          variant="ghost"
                          onClick={() => {
                            task.status === TaskDescStatusEnums.InProgress
                              ? handleStopProgressiveTaskGroup(task.taskGroup)
                              : handleResumeProgressiveTaskGroup(
                                  task.taskGroup
                                );
                          }}
                        />
                      </Tooltip>
                    )}

                    {(task.status === TaskDescStatusEnums.Failed ||
                      task.reason) && (
                      <Tooltip label={t("DownloadTasksPage.button.retry")}>
                        <IconButton
                          aria-label="retry"
                          icon={<LuRotateCcw />}
                          size="xs"
                          fontSize="sm"
                          h={21}
                          ml={1}
                          variant="ghost"
                          onClick={() =>
                            handleScheduleProgressiveTaskGroup(
                              task.taskGroup || "",
                              task.taskDescs.map((t) => t.payload)
                            )
                          }
                        />
                      </Tooltip>
                    )}

                    {task.status !== TaskDescStatusEnums.Cancelled && (
                      <Tooltip label={t("General.cancel")}>
                        <IconButton
                          aria-label="cancel"
                          icon={<LuX />}
                          size="xs"
                          fontSize="sm"
                          h={21}
                          variant="ghost"
                          onClick={() =>
                            handleCancelProgressiveTaskGroup(task.taskGroup)
                          }
                        />
                      </Tooltip>
                    )}

                    <IconButton
                      aria-label="toggle expansion"
                      icon={expanded ? <LuChevronDown /> : <LuChevronRight />}
                      size="xs"
                      fontSize="sm"
                      h={21}
                      variant="ghost"
                      onClick={() => toggleTaskExpansion(task.taskGroup)}
                    />
                  </HStack>
                </Flex>

                <Progress
                  value={task.progress}
                  colorScheme={primaryColor}
                  borderRadius="sm"
                />
              </VStack>,

              ...(expanded
                ? task.taskDescs.map((task) => (
                    <OptionItem
                      key={`${task.taskId}-detail`}
                      title={extractFileName(task.payload.dest, true)}
                      titleExtra={
                        task.status === TaskDescStatusEnums.InProgress && (
                          <Text
                            fontSize="xs"
                            className="secondary-text"
                            mt={0.5}
                          >
                            {`${formatByteSize(task.current)} / ${formatByteSize(
                              task.total
                            )}`}
                          </Text>
                        )
                      }
                    >
                      <Progress
                        w={36}
                        size="sm"
                        value={task.progress}
                        colorScheme={primaryColor}
                        borderRadius="sm"
                      />
                    </OptionItem>
                  ))
                : []),
            ]}
            maxFirstVisibleItems={4}
          />
        ))}
      </VStack>
    </Section>
  );
};

export default DownloadTasksPage;
