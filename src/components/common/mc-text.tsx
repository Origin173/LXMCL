import {
  Text as ChakraText,
  TextProps as ChakraTextProps,
} from "@chakra-ui/react";
import React from "react";

const colorMap: Record<string, string> = {
  "0": "#000000", // 黑色
  "1": "#0000AA", // 深蓝色
  "2": "#00AA00", // 深绿色
  "3": "#00AAAA", // 深青色
  "4": "#AA0000", // 深红色
  "5": "#AA00AA", // 深紫色
  "6": "#FFAA00", // 金色
  "7": "#AAAAAA", // 灰色
  "8": "#555555", // 深灰色
  "9": "#5555FF", // 蓝色
  a: "#55FF55", // 绿色
  b: "#55FFFF", // 青色
  c: "#FF5555", // 红色
  d: "#FF55FF", // 浅紫色
  e: "#FFFF55", // 黄色
  f: "#000000", // 白色
};

function parseMCColorString(input: string) {
  let currentColor = colorMap["f"];
  const segments: Array<{ text: string; color: string }> = [];
  let currentText = "";

  const pushSegment = () => {
    if (currentText) {
      segments.push({ text: currentText, color: currentColor });
      currentText = "";
    }
  };

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === "§" && i < input.length - 1) {
      const code = input[i + 1].toLowerCase();
      i++;
      pushSegment();
      if (code in colorMap) {
        currentColor = colorMap[code];
      } else if (code === "r") {
        currentColor = colorMap["f"];
      }
    } else {
      currentText += char;
    }
  }
  pushSegment();

  return segments;
}

export interface McTextProps extends ChakraTextProps {
  children?: React.ReactNode;
}

export const McText: React.FC<McTextProps> = ({ children, ...props }) => {
  if (typeof children === "string") {
    const segments = parseMCColorString(children);
    return (
      <ChakraText {...props}>
        {segments.map((segment, index) => (
          <ChakraText
            as="span"
            key={index}
            color={segment.color}
            display="inline"
          >
            {segment.text}
          </ChakraText>
        ))}
      </ChakraText>
    );
  }
  return <ChakraText {...props}>{children}</ChakraText>;
};

export function stripMCColorCodes(input: string): string {
  let output = "";
  for (let i = 0; i < input.length; i++) {
    if (input[i] === "§" && i < input.length - 1) {
      i++;
    } else {
      output += input[i];
    }
  }
  return output;
}
