import { Avatar, HStack, Tag, Text, VStack } from "@chakra-ui/react";
import { LuDownload, LuGlobe, LuUpload } from "react-icons/lu";
import Empty from "@/components/common/empty";
import { OptionItemProps } from "@/components/common/option-item";
import { useLauncherConfig } from "@/contexts/config";
import { OtherResourceInfo } from "@/models/resource";
import { ISOToDate } from "@/utils/datetime";
import { VirtualOptionItemGroup } from "./common/option-item-virtual";

interface ResourceDownloadListProps {
  list: OtherResourceInfo[];
  hasMore: boolean;
  loadMore: () => void;
}

const ResourceDownloadList: React.FC<ResourceDownloadListProps> = ({
  list,
  hasMore,
  loadMore,
}) => {
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  const buildOptionItems = (item: OtherResourceInfo): OptionItemProps => ({
    key: item.name,
    title: item.translatedName
      ? `${item.translatedName}｜${item.name}`
      : item.name,
    titleExtra: (
      <>
        {item.tags.map((tag) => (
          <Tag key={tag} colorScheme={primaryColor} className="tag-xs">
            {tag}
          </Tag>
        ))}
      </>
    ),
    description: (
      <VStack
        fontSize="xs"
        className="secondary-text no-select ellipsis-text"
        spacing={1}
        align="flex-start"
      >
        <Text overflow="hidden">{item.description}</Text>
        <HStack spacing={6}>
          <HStack spacing={1}>
            <LuUpload />
            <Text>{ISOToDate(item.lastUpdated)}</Text>
          </HStack>
          <HStack spacing={1}>
            <LuDownload />
            <Text>{item.downloads}</Text>
          </HStack>
          {item.source && (
            <HStack spacing={1}>
              <LuGlobe />
              <Text>{item.source}</Text>
            </HStack>
          )}
        </HStack>
      </VStack>
    ),
    prefixElement: (
      <Avatar
        src={item.iconSrc}
        name={item.name}
        boxSize="48px"
        borderRadius="4px"
      />
    ),
    children: <></>,
  });

  return (
    <>
      {list.length > 0 ? (
        <VirtualOptionItemGroup
          h="100%"
          items={list.map(buildOptionItems)}
          useInfiniteScroll
          hasMore={hasMore}
          loadMore={loadMore}
        />
      ) : (
        <Empty withIcon={false} size="sm" />
      )}
    </>
  );
};

export default ResourceDownloadList;
