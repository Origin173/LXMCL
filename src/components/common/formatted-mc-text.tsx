import { Text, TextProps } from "@chakra-ui/react";
import React from "react";

const colorMap: Record<string, string> = {
  "0": "#000000", // Black
  "1": "#0000AA", // Dark Blue
  "2": "#00AA00", // Dark Green
  "3": "#00AAAA", // Dark Cyan
  "4": "#AA0000", // Dark Red
  "5": "#AA00AA", // Dark Purple
  "6": "#FFAA00", // Gold
  "7": "#AAAAAA", // Gray
  "8": "#555555", // Dark Gray
  "9": "#5555FF", // Blue
  a: "#55FF55", // Green
  b: "#55FFFF", // Cyan
  c: "#FF5555", // Red
  d: "#FF55FF", // Light Purple
  e: "#FFFF55", // Yellow
  f: "", // White
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

export const FormattedMCText: React.FC<TextProps> = ({
  children,
  ...props
}) => {
  if (typeof children === "string") {
    const segments = parseMCColorString(children);
    return (
      <Text {...props}>
        {segments.map((segment, index) => (
          <Text
            as="span"
            key={index}
            display="inline"
            {...(segment.color && { color: segment.color })}
          >
            {segment.text}
          </Text>
        ))}
      </Text>
    );
  }
  return <Text {...props}>{children}</Text>;
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
