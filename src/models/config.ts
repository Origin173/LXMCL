export interface LauncherConfig {
  version: string;
  mocked: boolean;
  appearance: {
    theme: {
      primaryColor: string;
    },
    background: {
      presetChoice: string;
    }
  }
  general: {
    general: {
      language: string;
    }
  }
}


export const defaultConfig: LauncherConfig = {
  version: "dev",
  mocked: true,
  appearance: {
    theme: {
      primaryColor: "blue",
    },
    background: {
      presetChoice: "Jokull"
    }
  },
  general: {
    general: {
      language: "zh-Hans",
    },
  },
};