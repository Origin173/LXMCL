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

  const animationConfig = useMemo(
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

  const animationLabels: Record<AnimationType, string> = {
    idle: t("SkinPreviewModal.idle"),
    walk: t("SkinPreviewModal.walk"),
    run: t("SkinPreviewModal.run"),
    wave: t("SkinPreviewModal.wave"),
  };

  const rotationTooltipLabel = autoRotate
    ? t("SkinPreviewModal.disableRotation")
    : t("SkinPreviewModal.enableRotation");

  useEffect(() => {
    // create once
    if (canvasRef.current && !skinViewer) {
      const viewer = new skinview3d.SkinViewer({
        canvas: canvasRef.current,
        width: width,
        height: height - 32 - 8, // Subtract height for control bar and margin-top
      });

      viewer.zoom = 0.8;
      viewer.controls.enableZoom = false;
      viewer.animation = animationConfig.walk.animation;

      setSkinViewer(viewer);
    }
  }, [
    width,
    height,
    showControlBar,
    skinViewer,
    animationConfig.walk.animation,
  ]);

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
        skinViewer.animation = animationConfig[currentAnimation].animation;
      } else {
        skinViewer.animation = null;
        setAutoRotate(false);
      }
    }
  }, [skinViewer, autoRotate, currentAnimation, isPlaying, animationConfig]);

  return (
    <Box {...props}>
      <canvas ref={canvasRef} />
      {showControlBar && (
        <Flex alignItems="center" justifyContent="space-between" mt={2}>
          <HStack spacing={2}>
            <Tooltip label={animationLabels[currentAnimation]}>
              <IconButton
                aria-label="Switch Animation"
                icon={animationConfig[currentAnimation].icon}
                variant="ghost"
                onClick={() => {
                  const animationTypes: AnimationType[] = [
                    "idle",
                    "walk",
                    "run",
                    "wave",
                  ];
                  const currentIndex = animationTypes.indexOf(currentAnimation);
                  const nextIndex = (currentIndex + 1) % animationTypes.length;
                  setCurrentAnimation(animationTypes[nextIndex]);
                }}
              />
            </Tooltip>
            <Tooltip label={rotationTooltipLabel}>
              <IconButton
                aria-label="Toggle Rotation"
                icon={autoRotate ? <LuRefreshCw /> : <LuRefreshCwOff />}
                variant="ghost"
                onClick={() => setAutoRotate(!autoRotate)}
              />
            </Tooltip>
            <Tooltip
              label={
                isPlaying
                  ? t("SkinPreviewModal.pause")
                  : t("SkinPreviewModal.play")
              }
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
            <Text>{t("SkinPreviewModal.cape")}</Text>
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
