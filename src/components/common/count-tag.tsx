import { Tag, TagLabel, TagProps } from "@chakra-ui/react";

interface CountTagProps extends TagProps {
  count?: number;
  children?: React.ReactNode;
}

const CountTag: React.FC<CountTagProps> = ({ count, children, ...props }) => (
  <Tag borderRadius="full" colorScheme="blackAlpha" {...props}>
    <TagLabel>{count || Number(children) || 0}</TagLabel>
  </Tag>
);

export default CountTag;
