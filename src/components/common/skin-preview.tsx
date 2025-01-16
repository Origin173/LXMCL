import { Box, BoxProps, Flex, HStack, IconButton } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { LuRefreshCw, LuRefreshCwOff } from "react-icons/lu";
import * as skinview3d from "skinview3d";

interface SkinPreviewProps extends Omit<BoxProps, "width" | "height"> {
  skinUrl?: string;
  capeUrl?: string;
  width?: number;
  height?: number;
}

const SkinPreview: React.FC<SkinPreviewProps> = ({
  skinUrl = "/images/skins/unicorn_isla.png",
  capeUrl,
  width = 300,
  height = 400,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [skinViewer, setSkinViewer] = useState<skinview3d.SkinViewer | null>(
    null
  );

  const [autoRotate, setAutoRotate] = useState(false);

  useEffect(() => {
    // create once
    if (canvasRef.current && !skinViewer) {
      const viewer = new skinview3d.SkinViewer({
        canvas: canvasRef.current,
        width: width,
        height: height - 32,
      });

      viewer.zoom = 0.8;
      viewer.controls.enableZoom = false;
      viewer.animation = new skinview3d.WalkingAnimation();

      setSkinViewer(viewer);
    }
  }, [width, height, skinViewer]);

  useEffect(() => {
    if (skinViewer && skinUrl) {
      skinViewer.loadSkin(skinUrl);
    }
  }, [skinUrl, skinViewer]);

  useEffect(() => {
    if (skinViewer && capeUrl) {
      skinViewer.loadCape(capeUrl);
    }
  }, [capeUrl, skinViewer]);

  useEffect(() => {
    if (skinViewer) {
      skinViewer.autoRotate = autoRotate;
    }
  }, [autoRotate, skinViewer]);

  return (
    <Box {...props} bgColor="white">
      <canvas ref={canvasRef} />
      <Flex alignItems="flex-start" flexShrink={0}>
        <HStack>
          <IconButton
            aria-label="rotate"
            icon={autoRotate ? <LuRefreshCwOff /> : <LuRefreshCw />}
            variant="ghost"
            onClick={() => setAutoRotate(!autoRotate)}
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default SkinPreview;
