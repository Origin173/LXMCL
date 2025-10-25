/**
 * 整合包卡片组件 - 使用OptionItem风格
 * 显示整合包的基本信息（名称、版本、描述、封面等）
 */
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { FiDownload, FiFile, FiFolder } from "react-icons/fi";
import type { FsObject } from "@/types/openlist";

export interface ModpackCardProps {
  /** 文件/目录对象 */
  item: FsObject;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否选中 */
  isSelected?: boolean;
  /** 下载回调(仅文件) */
  onDownload?: (item: FsObject) => void;
  /** 查看详情回调 */
  onViewDetails?: (item: FsObject) => void;
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

/**
 * 格式化日期
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export const ModpackCard: React.FC<ModpackCardProps> = ({
  item,
  onClick,
  isSelected = false,
  onDownload,
  onViewDetails,
  primaryColor = "blue",
}) => {
  const isFolder = item.is_dir;
  const isZip = item.name.endsWith(".zip");
  const palettes = useColorModeValue([100, 200, 300], [900, 800, 700]);
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Flex
      justify="space-between"
      alignItems="center"
      borderRadius="md"
      border="1px solid"
      borderColor={isSelected ? `${primaryColor}.500` : borderColor}
      bg={isSelected ? `${primaryColor}.50` : "transparent"}
      _hover={{
        bg: `gray.${palettes[0]}`,
        borderColor: isSelected ? `${primaryColor}.500` : `gray.${palettes[1]}`,
        transition: "all 0.2s ease-in-out",
      }}
      _active={{
        bg: `gray.${palettes[1]}`,
        transition: "all 0.1s ease-in-out",
      }}
      cursor="pointer"
      p={2}
      onClick={onClick}
    >
      <HStack spacing={2.5} overflow="hidden" flex={1}>
        {/* 左侧：缩略图/图标 */}
        <Box flexShrink={0}>
          {item.thumb ? (
            <Image
              boxSize="32px"
              objectFit="cover"
              src={item.thumb}
              alt={item.name}
              borderRadius="4px"
            />
          ) : (
            <Icon
              as={isFolder ? FiFolder : isZip ? FiDownload : FiFile}
              boxSize={6}
              color={
                isFolder
                  ? `${primaryColor}.400`
                  : isZip
                    ? "green.400"
                    : "gray.400"
              }
            />
          )}
        </Box>

        {/* 中间：信息 */}
        <VStack spacing={0} alignItems="stretch" overflow="hidden" flex={1}>
          {/* 标题行 */}
          <HStack spacing={2}>
            <Text
              fontSize="xs-sm"
              noOfLines={1}
              fontWeight={isSelected ? "semibold" : "normal"}
            >
              {item.name}
            </Text>
            {isFolder && (
              <Badge colorScheme={primaryColor} fontSize="xs">
                文件夹
              </Badge>
            )}
            {isZip && (
              <Badge colorScheme="green" fontSize="xs">
                整合包
              </Badge>
            )}
          </HStack>

          {/* 描述行 */}
          <Text fontSize="xs" className="secondary-text" noOfLines={1}>
            {!isFolder && formatFileSize(item.size)}
            {item.modified &&
              ` • ${new Date(item.modified).toLocaleDateString("zh-CN")}`}
          </Text>
        </VStack>
      </HStack>

      {/* 右侧:操作按钮 */}
      {!isFolder && (
        <Button
          leftIcon={<FiDownload />}
          colorScheme={primaryColor}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDownload?.(item);
          }}
        >
          下载
        </Button>
      )}
    </Flex>
  );
};

export default ModpackCard;
