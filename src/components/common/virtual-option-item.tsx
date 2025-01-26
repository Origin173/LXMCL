import { Box, Card, Divider } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import { OptionItem, OptionItemProps } from "@/components/common/option-item";
import { Section, SectionProps } from "@/components/common/section";

export interface VirtualOptionItemGroupProps extends SectionProps {
  items: (OptionItemProps | React.ReactNode)[];
  withDivider?: boolean;
  itemHeight?: number; // 新增项高度属性
  height?: number; // 新增容器高度属性
}

export const VirtualOptionItemGroup: React.FC<VirtualOptionItemGroupProps> = ({
  items,
  withDivider = true,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemHeight, setItemHeight] = useState(50);

  useEffect(() => {
    if (containerRef.current) {
      const firstItem = containerRef.current.querySelector(".option-item");
      if (firstItem) {
        setItemHeight(firstItem.clientHeight);
      }
    }
  }, [items]);

  function isOptionItemProps(item: any): item is OptionItemProps {
    return (
      (item as OptionItemProps)?.title != null &&
      (item as OptionItemProps)?.children != null
    );
  }

  const rowRenderer = ({ index, style }: ListRowProps) => {
    const item = items[index];
    return (
      <div style={style}>
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
        <Card className="content-card" ref={containerRef} h="100%">
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
        </Card>
      )}
    </Section>
  );
};
