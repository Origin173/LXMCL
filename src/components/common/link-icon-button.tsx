import { IconButton, IconButtonProps, Tooltip } from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-shell";
import { useRouter } from "next/router";
import React from "react";
import { LuArrowRight, LuExternalLink } from "react-icons/lu";

interface LinkIconButtonProps extends IconButtonProps {
  url: string;
  ariaLabel?: string;
  isExternal?: boolean;
  size?: string;
  showTooltip?: boolean;
}

const LinkIconButton: React.FC<LinkIconButtonProps> = ({
  url,
  isExternal = false,
  showTooltip = false,
  size = "xs",
  ...buttonProps
}) => {
  const router = useRouter();

  const iconButton = (
    <IconButton
      onClick={() => {
        isExternal ? open(url) : router.push(url);
      }}
      variant="ghost"
      size="xs"
      icon={isExternal ? <LuExternalLink /> : <LuArrowRight />}
      {...buttonProps}
    />
  );

  return (
    <Tooltip
      label={url}
      fontSize={size}
      isDisabled={!showTooltip}
      aria-label={url}
    >
      {iconButton}
    </Tooltip>
  );
};

export default LinkIconButton;
