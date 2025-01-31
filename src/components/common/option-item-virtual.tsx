import { Box, Card, Divider } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import { OptionItem, OptionItemProps } from "@/components/common/option-item";
import { Section, SectionProps } from "@/components/common/section";

export { OptionItem };
export type { OptionItemProps };

export interface VirtualOptionItemGroupProps extends SectionProps {
  items: (OptionItemProps | React.ReactNode)[];
  withDivider?: boolean;
}

export const VirtualOptionItemGroup: React.FC<VirtualOptionItemGroupProps> = ({
  items,
  withDivider = true,
  ...props
}) => {
  const offscreenItemRef = useRef<HTMLDivElement>(null);
  const [itemHeight, setItemHeight] = useState(0);
  const [isHeightCalculated, setIsHeightCalculated] = useState(false);

  useEffect(() => {
    if (offscreenItemRef.current) {
      setItemHeight(offscreenItemRef.current.clientHeight);
      setIsHeightCalculated(true);
    }
  }, []);

  function isOptionItemProps(item: any): item is OptionItemProps {
    return (
      (item as OptionItemProps)?.title != null &&
      (item as OptionItemProps)?.children != null
    );
  }

  const rowRenderer = ({ index, style }: ListRowProps) => {
    const item = items[index];
    return (
      <div style={style} key={index}>
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
      </div>
    );
  };

  return (
    <Section {...props}>
      {items.length > 0 && (
        <Card className="content-card" h="100%">
          <Box
            ref={offscreenItemRef}
            position="absolute"
            visibility="hidden"
            pointerEvents="none"
          >
            {isOptionItemProps(items[0]) && (
              <OptionItem
                title={items[0].title}
                description={items[0].description}
                titleExtra={items[0].titleExtra}
                prefixElement={items[0].prefixElement}
              >
                {items[0].children}
              </OptionItem>
            )}
            {withDivider ? <Divider my={2} /> : <Box h={2} />}
          </Box>
          {isHeightCalculated && (
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  width={width}
                  rowCount={items.length}
                  rowHeight={itemHeight}
                  rowRenderer={rowRenderer}
                />
              )}
            </AutoSizer>
          )}
        </Card>
      )}
    </Section>
  );
};
