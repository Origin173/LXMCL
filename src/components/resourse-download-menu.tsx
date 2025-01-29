import {
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  Text,
} from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";

interface ResourceDownloadMenuProps {
  label: string;
  displayText: string;
  onChange: (value: string) => void;
  defaultValue: string;
  options: React.ReactNode;
}

const ResourceDownloadMenu: React.FC<ResourceDownloadMenuProps> = ({
  label,
  displayText,
  onChange,
  defaultValue,
  options,
}) => {
  return (
    <HStack gap={3}>
      <Text w={16} textAlign="right">
        {label}
      </Text>
      <Menu>
        <MenuButton
          as={Button}
          size="xs"
          w={36}
          variant="outline"
          fontSize="xs"
          textAlign="left"
          rightIcon={<LuChevronDown />}
        >
          {displayText}
        </MenuButton>
        <MenuList maxH="40vh" w={36} overflow="auto">
          <MenuOptionGroup
            defaultValue={defaultValue}
            type="radio"
            onChange={(value) => {
              onChange(value as string);
            }}
          >
            {options}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </HStack>
  );
};

export default ResourceDownloadMenu;
