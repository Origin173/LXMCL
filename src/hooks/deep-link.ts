import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import micromatch from "micromatch";
import { useEffect } from "react";

const SJMCL_LINK_PREFIX = "sjmcl://";

type TriggerRule = string | string[] | RegExp | ((subpath: string) => boolean);

interface UseDeepLinkOptions {
  trigger: TriggerRule;
  onCall: (path: string, subpath: string) => void;
}

export const useDeepLink = ({ trigger, onCall }: UseDeepLinkOptions) => {
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    function matchSubpath(path: string, rule: TriggerRule): boolean {
      if (typeof rule === "string" || Array.isArray(rule)) {
        return micromatch.isMatch(path, rule); // glob
      } else if (rule instanceof RegExp) {
        return rule.test(path); // regex
      } else if (typeof rule === "function") {
        return rule(path);
      }
      return false;
    }

    const setup = async () => {
      try {
        unlisten = await onOpenUrl((urls) => {
          urls.forEach((url) => {
            if (url.startsWith(SJMCL_LINK_PREFIX)) {
              const subpath = url.slice(SJMCL_LINK_PREFIX.length);
              if (matchSubpath(subpath, trigger)) {
                onCall(url, subpath);
              }
            }
          });
        });
      } catch (err) {
        console.error("Failed to listen to deep links:", err);
      }
    };

    setup();

    return () => {
      if (unlisten) unlisten();
    };
  }, [trigger, onCall]);
};

export default useDeepLink;
