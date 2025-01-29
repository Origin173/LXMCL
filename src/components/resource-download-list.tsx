import { Avatar, HStack, Tag, Text, VStack } from "@chakra-ui/react";
import { LuDownload, LuGlobe, LuUpload } from "react-icons/lu";
import Empty from "@/components/common/empty";
import { useLauncherConfig } from "@/contexts/config";
import { OtherResourceInfo } from "@/models/resource";
import { ISOToDate } from "@/utils/datetime";
import { OptionItem, OptionItemGroup } from "./common/option-item";

interface ResourceDownloadListProps {
  list: OtherResourceInfo[];
}

const ResourceDownloadList: React.FC<ResourceDownloadListProps> = ({
  list,
}) => {
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  return (
    <>
      {list.length > 0 ? (
        <OptionItemGroup
          w="100%"
          items={list.map((item) => (
            <OptionItem
              w="100%"
              key={item.name} // unique
              childrenOnHover
              title={
                item.translatedName
                  ? `${item.translatedName}｜${item.name}`
                  : item.name
              }
              titleExtra={
                <>
                  {item.tags.map((tag) => (
                    <Tag
                      key={tag}
                      colorScheme={primaryColor}
                      className="tag-xs"
                    >
                      {tag}
                    </Tag>
                  ))}
                </>
              }
              description={
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
              }
              prefixElement={
                <Avatar
                  src={item.iconSrc}
                  name={item.name}
                  boxSize="48px"
                  borderRadius="4px"
                />
              }
            >
              <HStack spacing={0}></HStack>
            </OptionItem>
          ))}
        />
      ) : (
        <Empty withIcon={false} size="sm" />
      )}
    </>
  );
};

export default ResourceDownloadList;
