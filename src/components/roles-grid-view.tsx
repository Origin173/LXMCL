import {
  Card,
  Wrap,
  WrapItem,
  VStack,
  Text,
  Image,
  Radio,
  RadioGroup,
  IconButton,
  Box,
  BoxProps
} from "@chakra-ui/react";
import { LuMoreHorizontal } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { Role } from "@/models/account";

interface RoleCardProps {
  role: Role;
  isSelected: boolean;
}

interface RolesGridProps extends BoxProps {
  roles: Role[];
}

const RoleCard: React.FC<RoleCardProps> = ({ role, isSelected }) => {
  const { t } = useTranslation();

  return (
    <Card 
      className="content-card" 
      w="10.55rem" 
      borderColor="blue.400"
      variant={isSelected ? "outline" : "elevated"}
    >
      <Box position="absolute" top={2} left={2}>
        <Radio value={role.uuid} />
      </Box>
      <IconButton 
        size="xs" variant="ghost"
        position="absolute" top={1} right={1}
        aria-label="operations"
        icon={<LuMoreHorizontal />}
      />
      <VStack spacing={0} >
        <Image
          boxSize='36px'
          objectFit='cover'
          src={role.avatarUrl}
          alt={role.name}
        />
        <Text 
          fontSize="xs-sm" 
          className="no-select"
          fontWeight={isSelected ? "bold" : "normal"}
          mt={2}
        >
          {role.name}
        </Text>
        <Text fontSize="xs" className="secondary-text no-select ellipsis-text">
          {role.type === "offline" ? t("Enums.roleTypes.offline") : role.authServer?.name}
        </Text>
      </VStack>
    </Card>
  );
};

const RolesGridView: React.FC<RolesGridProps> = ({ roles, ...boxProps }) => {
  return (
    <RadioGroup>  {/* TBD: select id and logic from context */}
      <Wrap spacing={3.5} {...boxProps}>
          {roles.map((role, index) => (
            <WrapItem key={role.id}>
              <RoleCard role={role} isSelected={index === 0}/>  {/* TBD: only mock */}
            </WrapItem>
          ))}
      </Wrap>
    </RadioGroup>
  );
};

export default RolesGridView;