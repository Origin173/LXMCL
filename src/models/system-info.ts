export interface JavaInfo {
  name: string;
  execDir: string;
  vendor: string;
  majorVersion: number;
  isLts: boolean;
}

export interface MemoryInfo {
  total: number;
  used: number;
}
