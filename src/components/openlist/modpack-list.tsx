/**
 * 整合包列表组件
 * 显示可用整合包的列表视图（单列垂直排列）
 */
import { Spinner, Stack, Text, VStack } from "@chakra-ui/react";
import React from "react";
import type { FsObject } from "@/types/openlist";
import { ModpackCard } from "./modpack-card";

export interface ModpackListProps {
  /** 整合包列表 */
  items: FsObject[];
  /** 加载状态 */
  loading?: boolean;
  /** 选中的项目(完整对象,用于精确匹配) */
  selectedItem?: FsObject | null;
  /** 选择回调 */
  onSelect?: (item: FsObject) => void;
  /** 下载回调 */
  onDownload?: (item: FsObject) => void;
  /** 查看详情回调 */
  onViewDetails?: (item: FsObject) => void;
  /** 主题色 */
  primaryColor?: string;
}

export const ModpackList: React.FC<ModpackListProps> = ({
  items,
  loading = false,
  selectedItem,
  onSelect,
  onDownload,
  onViewDetails,
  primaryColor = "blue",
}) => {
  if (loading) {
    return (
      <VStack py={8}>
        <Spinner size="xl" color={`${primaryColor}.500`} />
        <Text color="gray.500">加载中...</Text>
      </VStack>
    );
  }

  if (items.length === 0) {
    return (
      <VStack py={8}>
        <Text color="gray.500">暂无内容</Text>
      </VStack>
    );
  }

  return (
    <Stack spacing={2} width="100%">
      {items.map((item) => (
        <ModpackCard
          key={`${item.path}-${item.name}`}
          item={item}
          isSelected={
            selectedItem !== null &&
            selectedItem !== undefined &&
            item.path === selectedItem.path &&
            item.name === selectedItem.name
          }
          onClick={() => onSelect?.(item)}
          onDownload={onDownload}
          onViewDetails={onViewDetails}
          primaryColor={primaryColor}
        />
      ))}
    </Stack>
  );
};

export default ModpackList;
