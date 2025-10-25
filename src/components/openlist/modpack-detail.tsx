/**
 * 整合包详情组件 - 使用Section风格
 * 显示选中整合包的详细信息和操作按钮
 */
import { Button, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { FiDownload, FiFolder } from "react-icons/fi";
import { OptionItem, OptionItemGroup } from "@/components/common/option-item";
import { Section } from "@/components/common/section";
import type { FsObject } from "@/types/openlist";

export interface ModpackDetailProps {
  /** 文件/目录对象 */
  item: FsObject;
  /** 下载并安装回调 */
  onDownload?: (item: FsObject) => void;
  /** 浏览回调(用于目录) */
  onBrowse?: () => void;
  /** 主题色 */
  primaryColor?: string;
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "-";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export const ModpackDetail: React.FC<ModpackDetailProps> = ({
  item,
  onDownload,
  onBrowse,
  primaryColor = "blue",
}) => {
  const isFolder = item.is_dir;

  return (
    <VStack spacing={4} align="stretch" height="100%">
      {/* 基本信息 */}
      <Section title={item.name}>
        <OptionItemGroup
          items={[
            <OptionItem
              key="name"
              title="文件名"
              description={item.name}
              maxDescriptionLines={2}
            />,
            !isFolder && (
              <OptionItem
                key="size"
                title="文件大小"
                description={formatFileSize(item.size)}
              />
            ),
            <OptionItem
              key="modified"
              title="修改时间"
              description={new Date(item.modified).toLocaleString("zh-CN")}
            />,
            item.sign && (
              <OptionItem
                key="sign"
                title="文件签名"
                description={
                  <Text fontSize="xs" fontFamily="mono" isTruncated>
                    {item.sign}
                  </Text>
                }
              />
            ),
          ].filter(Boolean)}
          withDivider
        />
      </Section>

      {/* 操作按钮 */}
      <Section>
        {isFolder ? (
          <Button
            leftIcon={<FiFolder />}
            colorScheme={primaryColor}
            size="lg"
            width="100%"
            onClick={onBrowse}
          >
            浏览目录
          </Button>
        ) : (
          <Button
            leftIcon={<FiDownload />}
            colorScheme={primaryColor}
            size="lg"
            width="100%"
            onClick={() => onDownload?.(item)}
          >
            下载并安装
          </Button>
        )}
      </Section>
    </VStack>
  );
};

export default ModpackDetail;
