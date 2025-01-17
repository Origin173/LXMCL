import {
  Box,
  BoxProps,
  Flex,
  HStack,
  IconButton,
  Switch,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsPersonRaisedHand } from "react-icons/bs";
import { FaPerson, FaPersonRunning, FaPersonWalking } from "react-icons/fa6";
import { LuPause, LuPlay, LuRefreshCw, LuRefreshCwOff } from "react-icons/lu";
import * as skinview3d from "skinview3d";

type AnimationType = "idle" | "walk" | "run" | "wave";

interface SkinPreviewProps extends Omit<BoxProps, "width" | "height"> {
  skinSrc?: string;
  capeSrc?: string;
  width?: number;
  height?: number;
  animation?: AnimationType;
  showCape?: boolean;
  showControlBar?: boolean;
}

const SkinPreview: React.FC<SkinPreviewProps> = ({
  skinSrc = "/images/skins/unicorn_isla.png",
  capeSrc,
  width = 300,
  height = 400,
  animation = "walk",
  showCape = true,
  showControlBar = true,
  ...props
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [skinViewer, setSkinViewer] = useState<skinview3d.SkinViewer | null>(
    null
  );
  const [currentAnimation, setCurrentAnimation] =
    useState<AnimationType>(animation);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCapeVisible, setIsCapeVisible] = useState(showCape);

  const animationList = useMemo(
    () => ({
      idle: { icon: <FaPerson />, animation: new skinview3d.IdleAnimation() },
      walk: {
        icon: <FaPersonWalking />,
        animation: new skinview3d.WalkingAnimation(),
      },
      run: {
        icon: <FaPersonRunning />,
        animation: new skinview3d.RunningAnimation(),
      },
      wave: {
        icon: <BsPersonRaisedHand />,
        animation: new skinview3d.WaveAnimation(),
      },
    }),
    []
  );

  const animationTypes = Object.keys(animationList) as AnimationType[];

  useEffect(() => {
    // create once
    if (canvasRef.current && !skinViewer) {
      const viewer = new skinview3d.SkinViewer({
        canvas: canvasRef.current,
        width: width,
        height: height - 40, // Subtract height for control bar and top-margin
      });

      viewer.zoom = 0.8;
      viewer.controls.enableZoom = false;

      setSkinViewer(viewer);
    }
  }, [width, height, showControlBar, skinViewer, animationList.walk.animation]);

  useEffect(() => {
    setIsCapeVisible(showCape);
  }, [showCape]);

  useEffect(() => {
    if (skinViewer) {
      skinViewer.loadSkin(skinSrc);
      if (isCapeVisible && capeSrc) {
        skinViewer.loadCape(capeSrc);
      } else {
        skinViewer.loadCape(null);
      }
    }
  }, [skinViewer, skinSrc, capeSrc, isCapeVisible]);

  useEffect(() => {
    if (skinViewer) {
      skinViewer.autoRotate = isPlaying && autoRotate;
      if (isPlaying) {
        skinViewer.animation = animationList[currentAnimation].animation;
      } else {
        skinViewer.animation = null;
        setAutoRotate(false);
      }
    }
  }, [skinViewer, autoRotate, currentAnimation, isPlaying, animationList]);

  return (
    <Box {...props}>
      <canvas ref={canvasRef} />
      {showControlBar && (
        <Flex alignItems="center" justifyContent="space-between" mt={2}>
          <HStack spacing={0}>
            <Tooltip label={t(`SkinPreview.animation.${currentAnimation}`)}>
              <IconButton
                aria-label="Switch Animation"
                icon={animationList[currentAnimation].icon}
                variant="ghost"
                onClick={() => {
                  const currentIndex = animationTypes.indexOf(currentAnimation);
                  const nextIndex = (currentIndex + 1) % animationTypes.length;
                  setCurrentAnimation(animationTypes[nextIndex]);
                }}
              />
            </Tooltip>
            <Tooltip
              label={t(
                `SkinPreview.Button.${autoRotate ? "disable" : "enable"}Rotation`
              )}
            >
              <IconButton
                aria-label="Toggle Rotation"
                icon={autoRotate ? <LuRefreshCw /> : <LuRefreshCwOff />}
                variant="ghost"
                onClick={() => setAutoRotate(!autoRotate)}
              />
            </Tooltip>
            <Tooltip
              label={t(`SkinPreview.Button.${isPlaying ? "pause" : "play"}`)}
            >
              <IconButton
                aria-label="Play/Pause Animation"
                icon={isPlaying ? <LuPause /> : <LuPlay />}
                variant="ghost"
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  if (isPlaying) {
                    setAutoRotate(false);
                  }
                }}
              />
            </Tooltip>
          </HStack>
          <HStack>
            <Text fontSize="sm">{t("SkinPreview.cape")}</Text>
            <Switch
              isChecked={isCapeVisible}
              onChange={(e) => setIsCapeVisible(e.target.checked)}
            />
          </HStack>
        </Flex>
      )}
    </Box>
  );
};

export default SkinPreview;
