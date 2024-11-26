import React from 'react';
import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { LuExternalLink, LuArrowRight } from 'react-icons/lu';
import { open } from '@tauri-apps/plugin-shell';

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
      variant="ghost" size="xs"
      icon={isExternal ? <LuExternalLink /> : <LuArrowRight />}
      {...buttonProps}
    />
  );
};

export default LinkIconButton;
