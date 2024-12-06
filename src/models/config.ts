export interface LauncherConfig {
  version: string;
  mocked: boolean;
  appearance: {
    theme: {
      primaryColor: string;
      headNavStyle: string;
    };
    background: {
      presetChoice: string;
    };
  };
  download: {
    source: {
      strategy: string;
    };
    download: {
      autoConcurrent: boolean;
      concurrentCount: number;
      enableSpeedLimit: boolean;
      speedLimitValue: number;
    };
    cache: {
      directory: string;
    };
  };
  general: {
    general: {
      language: string;
    };
  };
}

export const defaultConfig: LauncherConfig = {
  version: "dev",
  mocked: true,
  appearance: {
    theme: {
      primaryColor: "blue",
      headNavStyle: "standard",
    },
    background: {
      presetChoice: "Jokull",
    },
  },
  download: {
    source: {
      strategy: "auto",
    },
    download: {
      autoConcurrent: true,
      concurrentCount: 64,
      enableSpeedLimit: false,
      speedLimitValue: 1024,
    },
    cache: {
      directory: "/mock/path/to/cache/",
    },
  },
  general: {
    general: {
      language: "zh-Hans",
    },
  },
};
