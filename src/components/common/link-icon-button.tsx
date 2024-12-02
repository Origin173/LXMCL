import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-shell";
import { useRouter } from "next/router";
import React from "react";
import { LuArrowRight, LuExternalLink } from "react-icons/lu";

interface LinkIconButtonProps extends IconButtonProps {
  url: string;
  ariaLabel?: string;
  isExternal?: boolean;
}

const LinkIconButton: React.FC<LinkIconButtonProps> = ({
  url,
  isExternal = false,
  ...buttonProps
}) => {
  const router = useRouter();

  return (
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
};

export default LinkIconButton;
