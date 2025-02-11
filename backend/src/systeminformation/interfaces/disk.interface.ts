export interface DiskData {
    device: string;
    mount: string;
    type: string;
    size: number; // Total size in bytes
    used: number; // Used space in bytes
    available: number; // Available space in bytes
    use: number; // Percentage of disk space used
  }