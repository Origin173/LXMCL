import {
  Box,
  BoxProps,
  Card,
  Center,
  Divider,
  Flex,
  HStack,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { BeatLoader } from "react-spinners";
import { Section, SectionProps } from "@/components/common/section";

export interface OptionItemProps extends BoxProps {
  prefixElement?: React.ReactNode;
  title: string;
  titleExtra?: React.ReactNode;
  description?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
  childrenOnHover?: boolean;
}

export interface OptionItemGroupProps extends SectionProps {
  items: (OptionItemProps | React.ReactNode)[];
  withDivider?: boolean;
  useInfiniteScroll?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
}

export const OptionItem: React.FC<OptionItemProps> = ({
  prefixElement,
  title,
  titleExtra,
  description,
  isLoading = false,
  children,
  childrenOnHover = false,
  ...boxProps
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Flex
      justify="space-between"
      alignItems="center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...boxProps}
    >
      <HStack spacing={2.5} overflowY="hidden">
        {prefixElement && (
          <Skeleton isLoaded={!isLoading}>{prefixElement}</Skeleton>
        )}
        <VStack spacing={0} mr={2} alignItems="start" overflow="hidden">
          <HStack spacing={2} flexWrap="wrap">
            <Skeleton isLoaded={!isLoading}>
              <Text fontSize="xs-sm" className="no-select">
                {title}
              </Text>
            </Skeleton>
            {titleExtra &&
              (isLoading ? (
                <Skeleton isLoaded={!isLoading}>
                  <Text fontSize="xs-sm">
                    PLACEHOLDER {/*width holder for skeleton*/}
                  </Text>
                </Skeleton>
              ) : (
                titleExtra
              ))}
          </HStack>
          {description &&
            (typeof description === "string" ? (
              <Skeleton isLoaded={!isLoading}>
                <Text fontSize="xs" className="secondary-text no-select">
                  {description}
                </Text>
              </Skeleton>
            ) : (
              description
            ))}
        </VStack>
      </HStack>
      {(childrenOnHover ? isHovered : true) &&
        (typeof children === "string" ? (
          <Skeleton isLoaded={!isLoading}>
            <Text fontSize="xs-sm" className="secondary-text">
              {children}
            </Text>
          </Skeleton>
        ) : (
          children
        ))}
    </Flex>
  );
};

export const OptionItemGroup: React.FC<OptionItemGroupProps> = ({
  items,
  withDivider = true,
  useInfiniteScroll = false,
  hasMore = false,
  loadMore = () => {},
  ...props
}) => {
  function isOptionItemProps(item: any): item is OptionItemProps {
    return (
      (item as OptionItemProps)?.title != null &&
      (item as OptionItemProps)?.children != null
    );
  }

  const cardProps = useInfiniteScroll
    ? { h: "100%", overflowY: "auto" as "auto" }
    : {};

  return (
    <Section {...props}>
      {items.length > 0 && (
        <Card className="content-card" {...cardProps}>
          <InfiniteScroll
            loadMore={loadMore}
            hasMore={hasMore}
            useWindow={false}
            loader={
              <Center>
                <BeatLoader size={16} color="gray" />
              </Center>
            }
          >
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {isOptionItemProps(item) ? (
                  <OptionItem
                    title={item.title}
                    description={item.description}
                    titleExtra={item.titleExtra}
                    prefixElement={item.prefixElement}
                  >
                    {item.children}
                  </OptionItem>
                ) : (
                  item
                )}
                {index !== items.length - 1 &&
                  (withDivider ? <Divider my={2} /> : <Box h={2} />)}
              </React.Fragment>
            ))}
          </InfiniteScroll>
        </Card>
      )}
    </Section>
  );
};
