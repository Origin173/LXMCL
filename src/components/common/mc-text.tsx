import { Text as McText, TextProps } from "@chakra-ui/react";
import React from "react";

const GameText = ({ children, ...props }: TextProps) => {
  const colorMap = {
    "0": "#000000", // 黑色
    "1": "#0000AA", // 深蓝
    "2": "#00AA00", // 绿色
    "3": "#00AAAA", // 浅绿色
    "4": "#AA0000", // 红色
    "5": "#AA00AA", // 紫色
    "6": "#FFAA00", // 金色
    "7": "#AAAAAA", // 灰色
    "8": "#555555", // 深灰
    "9": "#5555FF", // 蓝色
    a: "#55FF55", // 亮绿色
    b: "#55FFFF", // 青色
    c: "#FF5555", // 亮红
    d: "#FF55FF", // 粉红
    e: "#FFFF55", // 亮黄
    f: "#FFFFFF", // 白色
  };

  // 处理 Minecraft 格式化字符串，将其拆分为带有颜色的文本片段
  const processMinecraftText = (text: string) => {
    const parts: { text: string; color: string }[] = [];
    let currentColor = "#000000"; // 默认颜色
    let currentText = "";

    for (let i = 0; i < text.length; i++) {
      if (text[i] === "§" && i + 1 < text.length) {
        const colorCode = text[i + 1].toLowerCase() as keyof typeof colorMap;
        if (colorMap[colorCode]) {
          if (currentText) {
            parts.push({ text: currentText, color: currentColor });
            currentText = "";
          }
          currentColor = colorMap[colorCode];
          i++; // 跳过颜色代码的第二个字符
        } else {
          currentText += text[i];
        }
      } else {
        currentText += text[i];
      }
    }

    if (currentText) {
      parts.push({ text: currentText, color: currentColor });
    }

    return parts;
  };

  // 处理后的文本片段
  const processedText = processMinecraftText(
    typeof children === "string" ? children : ""
  );

  return (
    <McText {...props}>
      {processedText.map((part, index) => (
        <span key={index} style={{ color: part.color }}>
          {part.text}
        </span>
      ))}
    </McText>
  );
};

export default GameText;
