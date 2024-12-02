import { BoxProps, Heading, Highlight } from "@chakra-ui/react";
import styles from "./logo-title.module.css";

interface LogoTitleProps extends BoxProps {}

export const TitleShort: React.FC<LogoTitleProps> = (props) => {
  return (
    <Heading size="md" className={styles.title + " no-select"} {...props}>
      <Highlight query="L" styles={{ color: "blue.600" }}>
        SJMCL
      </Highlight>
    </Heading>
  );
};

export const TitleFull: React.FC<LogoTitleProps> = (props) => {
  return (
    <Heading size="md" className={styles.title + " no-select"} {...props}>
      <Highlight query="L" styles={{ color: "blue.600" }}>
        SJMC Launcher
      </Highlight>
    </Heading>
  );
};
